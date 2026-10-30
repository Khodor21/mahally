import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = "mahally-images";
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
const SUPABASE_BUCKET = "Mahally Images";

async function migrate() {
  const { data: stores } = await supabase
    .from("store_settings")
    .select("id, logo_url")
    .not("logo_url", "is", null);

  if (!stores?.length) {
    console.log("No stores found");
    return;
  }

  console.log(`Found ${stores.length} stores`);

  for (const store of stores) {
    if (!store.logo_url || store.logo_url.includes("r2.dev")) continue;

    try {
      const url = new URL(store.logo_url);
      const pathAfterBucket = url.pathname
        .split(`/Mahally%20Images/`)[1]
        ?.replace(/%20/g, " ");

      if (!pathAfterBucket) {
        console.warn("Could not extract path from:", store.logo_url);
        continue;
      }

      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .download(pathAfterBucket);

      if (error || !data) {
        console.warn("Failed to download:", pathAfterBucket, error?.message);
        continue;
      }

      const buffer = Buffer.from(await data.arrayBuffer());

      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: pathAfterBucket,
          Body: buffer,
          ContentType: data.type || "image/png",
          CacheControl: "public, max-age=31536000",
        }),
      );

      const newUrl = `${PUBLIC_URL}/${pathAfterBucket}`;

      await supabase
        .from("store_settings")
        .update({ logo_url: newUrl })
        .eq("id", store.id);

      console.log("✅ Logo migrated:", store.id);
    } catch (err) {
      console.error("Logo migration error:", store.id, err);
    }
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);

import "dotenv/config";
// scripts/migrate-images-to-r2.ts
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
  // جيب كل المنتجات اللي عندها صور
  const { data: products } = await supabase
    .from("products")
    .select("id, images")
    .not("images", "eq", "{}");

  if (!products?.length) {
    console.log("No products found");
    return;
  }

  console.log(`Found ${products.length} products`);

  for (const product of products) {
    if (!product.images?.length) continue;

    const newUrls: string[] = [];

    for (const imageUrl of product.images) {
      // تجاهل الصور اللي صارت على R2
      if (imageUrl.includes("r2.dev")) {
        newUrls.push(imageUrl);
        continue;
      }

      try {
        // استخرج الـ path من Supabase URL
        const url = new URL(imageUrl);
        const pathAfterBucket = url.pathname
          .split(`/Mahally%20Images/`)[1]
          ?.replace(/%20/g, " ");

        if (!pathAfterBucket) {
          console.warn("Could not extract path from:", imageUrl);
          newUrls.push(imageUrl);
          continue;
        }

        // حمّل من Supabase
        const { data, error } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .download(pathAfterBucket);

        if (error || !data) {
          console.warn("Failed to download:", pathAfterBucket, error?.message);
          newUrls.push(imageUrl);
          continue;
        }

        const buffer = Buffer.from(await data.arrayBuffer());
        const contentType = data.type || "image/jpeg";

        // ارفع على R2 بنفس الـ path
        await r2.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: pathAfterBucket,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000",
          }),
        );

        const newUrl = `${PUBLIC_URL}/${pathAfterBucket}`;
        newUrls.push(newUrl);
        console.log("✅ Migrated:", pathAfterBucket);
      } catch (err) {
        console.error("Error migrating:", imageUrl, err);
        newUrls.push(imageUrl); // خلي الـ URL القديم إذا فشل
      }
    }

    // حدّث الـ DB بالـ URLs الجديدة
    await supabase
      .from("products")
      .update({ images: newUrls })
      .eq("id", product.id);

    console.log(`Updated product ${product.id}`);
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);

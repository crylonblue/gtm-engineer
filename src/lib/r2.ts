import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;
let bucket: string = "";
let warned = false;

function getClient(): S3Client | null {
  if (client) return client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    if (!warned) {
      console.warn(
        "R2 env vars missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) — R2 storage disabled",
      );
      warned = true;
    }
    return null;
  }

  bucket = bucketName;
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

export async function listObjects(prefix: string): Promise<string[]> {
  const s3 = getClient();
  if (!s3) return [];

  const res = await s3.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
  );
  return (res.Contents ?? []).map((obj) => obj.Key!).filter(Boolean);
}

export async function getJson(key: string): Promise<unknown> {
  const s3 = getClient();
  if (!s3) return null;

  const res = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  const body = await res.Body?.transformToString();
  return body ? JSON.parse(body) : null;
}

export async function getText(key: string): Promise<string> {
  const s3 = getClient();
  if (!s3) return "";

  const res = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  return (await res.Body?.transformToString()) ?? "";
}

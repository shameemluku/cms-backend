import AWS from "aws-sdk";

class S3Service {
  private static instance: S3Service;
  private s3: AWS.S3;

  private constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  public async uploadBase64Image(
    base64Image: string,
    bucketName: string,
    fileName: string
  ): Promise<string> {
    try {
      let base64 = base64Image.replace(/^data:.+;base64,/, "");
      const imageBuffer = Buffer.from(base64, "base64");

      const params: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: fileName,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      };

      const data = await this.s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw error;
    }
  }

  public async getS3File(fileKey: string, bucket: string): Promise<any> {
    try {
      const data = await this.s3
        .getObject({
          Key: fileKey,
          Bucket: bucket,
        })
        .promise();

      return data;
    } catch (err) {
      return err;
    }
  }
}

export default S3Service;

import json
import boto3
import os

s3 = boto3.client(
    "s3",
    region_name="ap-south-2",
    endpoint_url="https://s3.ap-south-2.amazonaws.com"
)

BUCKET_NAME = os.environ["BUCKET_NAME"]


def lambda_handler(event, context):
    try:
        # Get logged-in user's Cognito information
        claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
        user_id = claims["sub"]

        # Get filename from request body
        body = json.loads(event.get("body", "{}"))
        filename = body.get("filename")

        if not filename:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({
                    "error": "Filename is required"
                })
            }

        # Build user-specific S3 key
        object_key = f"{user_id}/{filename}"

        # Generate temporary download URL
        download_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": object_key
            },
            ExpiresIn=300
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "download_url": download_url,
                "filename": filename
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }
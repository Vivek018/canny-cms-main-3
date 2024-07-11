import { PassThrough } from 'stream'

import {
	type UploadHandler,
	writeAsyncIterableToWritable,
} from '@remix-run/node'
import AWS from 'aws-sdk'

const { STORAGE_ACCESS_KEY, STORAGE_SECRET, STORAGE_REGION, STORAGE_BUCKET } =
	process.env

if (
	!(STORAGE_ACCESS_KEY && STORAGE_SECRET && STORAGE_REGION && STORAGE_BUCKET)
) {
	throw new Error(`Storage is missing required configuration.`)
}

export const deleteFile = ({
	Key,
}: Pick<AWS.S3.Types.PutObjectRequest, 'Key'>) => {
	const s3 = new AWS.S3({
		credentials: {
			accessKeyId: STORAGE_ACCESS_KEY,
			secretAccessKey: STORAGE_SECRET,
		},
		region: STORAGE_REGION,
	})

	return Key
		? s3
				.deleteObject({
					Bucket: STORAGE_BUCKET,
					Key: Key?.replaceAll('%20', ' '),
				})
				.promise()
		: null
}

const uploadStream = ({ Key }: Pick<AWS.S3.Types.PutObjectRequest, 'Key'>) => {
	const s3 = new AWS.S3({
		credentials: {
			accessKeyId: STORAGE_ACCESS_KEY,
			secretAccessKey: STORAGE_SECRET,
		},
		region: STORAGE_REGION,
	})

	const pass = new PassThrough()
	return {
		writeStream: pass,
		promise: s3.upload({ Bucket: STORAGE_BUCKET, Key, Body: pass }).promise(),
	}
}

export async function uploadStreamToS3(data: any, filename: string) {
	if (!data || !filename) {
		return '/no_image.jpeg'
	}
	const stream = uploadStream({
		Key: filename,
	})
	await writeAsyncIterableToWritable(data, stream.writeStream)
	const file = await stream.promise
	return file.Location
}

export const s3UploadHandler: UploadHandler = async ({
	name,
	filename,
	data,
}) => {
	if (name !== 'photo' && name !== 'confirmation_document' && name !== 'path') {
		return
	}
	const uploadedFileLocation = await uploadStreamToS3(data, filename!)

	return uploadedFileLocation
}

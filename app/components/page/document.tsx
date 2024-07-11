import { Link } from '@remix-run/react'
import { useMemo, useState } from 'react'
import { pdfjs, Document, Page } from 'react-pdf'
import { imageFieldName } from '@/utils/input-types'
import { DetailsData } from '../details-data'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

type DocumentProps = {
	data: any
	keys: any
	imageField: any
	routeName: string
}

export function DocumentPage({
	data,
	keys,
	imageField,
	routeName,
}: DocumentProps) {
	const noImage = '/no_image.jpeg'
	const file = data[imageFieldName[routeName]] ?? noImage
	const fileType = file?.split('.')[file.split('.').length - 1]

	const options = useMemo(
		() => ({
			cMapUrl: '/cmaps/',
			standardFontDataUrl: '/standard_fonts/',
		}),
		[],
	)
	const [numPages, setNumPages] = useState<number>()
	const onDocumentLoadSuccess = ({ numPages: nextNumPages }: any): void => {
		setNumPages(nextNumPages)
	}

	let children = (
		<div className="grid h-full w-full place-items-center text-3xl tracking-widest">
			Download File
		</div>
	)

	if (['png', 'jpeg', 'jpg', 'webp'].includes(fileType)) {
		children = (
			<img
				className="h-full object-contain"
				src={file ?? noImage}
				alt={data.label}
			/>
		)
	} else if (['pdf'].includes(fileType)) {
		children = (
			<Document
				file={file}
				onLoadSuccess={onDocumentLoadSuccess}
				options={options}
			>
				{Array.from(new Array(numPages), (_, index) => (
					<Page key={`page_${index + 1}`} pageNumber={index + 1} />
				))}
			</Document>
		)
	}

	return (
		<div className="mx-20 -mt-10 flex h-[90%] flex-col items-center">
			<DetailsData
				data={data}
				keys={keys}
				imageField={imageField}
				className="my-8 flex"
			/>
			<div className="grid h-full w-full place-items-center overflow-scroll rounded-md border border-gray-300">
				{file && file !== noImage ? (
					<Link
						className="grid h-full w-full place-items-center hover:bg-accent/80 hover:opacity-80 dark:opacity-70"
						to={file}
					>
						{children}
					</Link>
				) : (
					<div className="grid h-full w-full place-items-center dark:opacity-70">
						{children}
					</div>
				)}
			</div>
		</div>
	)
}

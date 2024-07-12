import { Document, Page, PDFViewer, Text, View } from '@react-pdf/renderer'
import { useIsDocument } from '@/utils/clients/is-document'
import { cn, replaceUnderscore } from '@/utils/misx'
import { pdfTemplates, styles } from '@/utils/pdf-list.client'

export const PDF = ({
	type,
	data,
	address,
}: {
	type: any
	data: any
	address?: string
}) => {
	const { isDocument } = useIsDocument()

	return (
		<PDFViewer
			className={cn('hidden', isDocument && 'flex')}
			style={{ width: innerWidth - 320, height: innerHeight - 80 }}
		>
			<Document title={replaceUnderscore(type)?.toUpperCase()}>
				<Page size="A4" style={styles().page}>
					<View style={styles().page}>
						<View style={styles().section}>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									alignSelf: 'flex-end',
								}}
							>
								<Text>Date:</Text>
								<Text
									style={{
										marginLeft: 4,
									}}
								>
									{new Date().toLocaleDateString()}
								</Text>
							</View>
							<Text>To,</Text>
							<Text>{data.full_name},</Text>
							<Text style={{ width: 180 }}>
								{address?.replaceAll(',', ',\n')}
							</Text>
						</View>
						{pdfTemplates[type as keyof typeof pdfTemplates](data)}
						<View style={styles().signature}>
							<Text>Sincerely,</Text>
						</View>
					</View>
				</Page>
			</Document>
		</PDFViewer>
	)
}

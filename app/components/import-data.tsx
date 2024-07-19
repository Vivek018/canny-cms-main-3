import { Form } from '@remix-run/react'
import { cn, replaceUnderscore } from '@/utils/misx'
import { Modal } from './modal'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table'

type ImportDataProps = {
	master: string
	header: string[]
	body: string[][]
	action?: string
	setImportData: any
}

export function ImportData({
	master,
	header,
	body,
	action,
	setImportData,
}: ImportDataProps) {
	return (
		<Modal
			inMiddle
			link={`/${master}?imported=true`}
			iconClassName="hidden"
			className={cn(
				'my-10 flex max-h-[700px] max-w-[80%] flex-col gap-2 overflow-scroll rounded-md bg-muted p-4 text-muted-foreground',
			)}
			shouldNotNavigate
		>
			<div className="flex h-full w-full items-center justify-between gap-2 py-1">
				<h1 className="text-lg font-semibold tracking-wide">
					Total Entries: {body?.length ?? 0}
				</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="accent"
						onClick={() => setImportData(null)}
						className="h-full py-2.5"
					>
						Cancel
					</Button>
					<Button
						variant="secondary"
						className="h-full gap-1.5 rounded-sm py-2.5"
						form="import-form"
					>
						<Icon name="plus-circled" />
						Bulk Add Data
					</Button>
				</div>
			</div>
			<Form
				method="POST"
				id="import-form"
				action={action ?? `/${master}/import-data`}
				className="no-scrollbar relative overflow-scroll rounded-md"
			>
				<input type="hidden" name={'headers'} value={header} />
				<Table>
					<TableHeader>
						<TableRow>
							{header?.map((value, index) => {
								return (
									<TableHead
										key={value + index}
										className="h-max w-max truncate py-3 capitalize"
									>
										{replaceUnderscore(value)}
									</TableHead>
								)
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{body ? (
							body?.map((row, index) => (
								<>
									<input type="hidden" name={'row'} value={row} />
									<TableRow key={index}>
										{row.map((cell, index) => {
											return (
												<TableCell key={cell + index} className="py-3">
													{cell}
												</TableCell>
											)
										})}
									</TableRow>
								</>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center text-base">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Form>
		</Modal>
	)
}

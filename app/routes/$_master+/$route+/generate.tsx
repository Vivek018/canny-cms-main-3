import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, useLoaderData, useNavigate } from '@remix-run/react'
import { Modal } from '@/components/modal'
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { Icon } from '@/components/ui/icon'
import { cn, replaceUnderscore } from '@/utils/misx'
import { generateEnabledList } from '@/utils/pdf-list'

export async function loader({ params }: LoaderFunctionArgs) {
	return json({ master: params._master!, route: params.route! })
}

export default function Generate() {
	const { master, route } = useLoaderData<typeof loader>()
	const navigate = useNavigate()

	return (
		<Modal inMiddle iconClassName="hidden" className={cn('px-6 py-6')}>
			<Command className="bg-transparent">
				<CommandInput
					divClassName={cn(
						'px-4 bg-muted dark:bg-accent rounded-md border-none shadow-md',
					)}
					className="placeholder:text-gray-400"
					placeholder="Search"
				/>
				<CommandList className="no-scrollbar mt-6 max-h-[600px]">
					<CommandGroup>
						<div className="grid w-full grid-cols-4 place-items-center gap-8">
							{generateEnabledList[master]?.map((val: any) => {
								const value = replaceUnderscore(val)
								return (
									<CommandItem
										key={val}
										value={value}
										className="w-32 min-w-full p-2"
										onSelect={() =>
											navigate(`/${master}/${route}/${val}/letter`)
										}
									>
										<Link
											key={val}
											to={`/${master}/${route}/${val}/letter`}
											className="my-1.5 flex min-w-full flex-col items-center justify-center gap-3 rounded-sm capitalize"
										>
											<Icon
												name="file-text"
												className="h-16 w-16"
											/>
											<p className="text-center">{value}</p>
										</Link>
									</CommandItem>
								)
							})}
						</div>
					</CommandGroup>
				</CommandList>
			</Command>
		</Modal>
	)
}

import {
	FormProvider,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	json,
	Link,
	useActionData,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { useRef, useState } from 'react'
import { z } from 'zod'
import {
	Field,
	RadioField,
	SelectorField,
	TextareaField,
} from '@/components/forms'
import { Modal } from '@/components/modal'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { singleRouteName } from '@/constant'
import { inputTypes } from '@/utils/input-types'
import { dateConvertForInput, replaceUnderscore } from '@/utils/misx'
import { getSelectorKeys, Schemas } from '@/utils/schema'
import { inputList } from '@/utils/servers/list.server'
import { action as upsertAction } from './_actions+/$master.upsert'

export async function loader({
	request,
	params,
	data,
	route,
}: LoaderFunctionArgs & { data: any; route: string }) {
	const master = params.master
	const routeName = singleRouteName[master as string]
	const url = new URL(request.url)
	const dependency = url.searchParams.get('projectDependency')
	const list = inputList[routeName]
		? dependency
			? await inputList[routeName](dependency)
			: await inputList[routeName]()
		: []

	return json({
		list,
		master,
		data,
		routeName,
		route,
	})
}

export async function action(args: ActionFunctionArgs) {
	return await upsertAction(args)
}

export default function UpsertUser({
	fixedRouteName,
	fixedData,
	link,
	data,
}: {
	fixedRouteName?: string
	fixedData?: any
	link?: string
	data?: any
}) {
	const {
		list,
		master,
		routeName: loaderRouteName,
		route,
	} = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	const routeName = fixedRouteName ?? loaderRouteName
	const Schema = Schemas[routeName]

	const [form, fields] = useForm({
		id: `add-${routeName}`,
		constraint: getZodConstraint(Schema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: Schema })
		},
		defaultValue: { ...data },
		shouldValidate: 'onInput',
		shouldRevalidate: 'onInput',
	})
	const [dependStateValue, setDependStateValue] = useState<any>()
	const resetButtonRef = useRef<any>()
	const [searchParams, setSearchParams] = useSearchParams()

	const initialValue = Object.fromEntries(
		Object.entries(Schema.shape).map(([key, value]) => {
			if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
			return [key, undefined]
		}),
	)

	const goBackLink = route ? `/${master}/${route}` : `/${master}`

	return (
		<Modal link={link ?? goBackLink} shouldNotNavigate>
			<FormProvider context={form.context}>
				<div className="mb-4 mt-2 flex w-full items-center gap-2">
					<Link
						to={goBackLink}
						className="grid h-full place-items-center rounded-sm px-1.5 py-1 hover:bg-accent"
					>
						<Icon name="chevron-left" size="md" />
					</Link>
					<h1 className="text-2xl font-bold capitalize tracking-wide">
						{!data ? 'Add' : 'Update'} {replaceUnderscore(routeName)}
					</h1>
				</div>
				<Form
					method="POST"
					{...getFormProps(form)}
					encType="multipart/form-data"
					className="py-3"
				>
					{data ? <input type="hidden" name="id" value={data?.id} /> : null}
					{getSelectorKeys(routeName).map((value, index) => {
						const inputTypeValue = inputTypes[routeName][value]
						const dependency = inputTypeValue?.dependency
						const dependant = inputTypeValue?.dependant
						const dependsOn = inputTypeValue?.dependsOn
						const dependsValue = inputTypeValue?.dependsValue
						const type = inputTypeValue?.type
						const label = type && inputTypeValue?.label
						const name = type && inputTypeValue?.name
						const isMulti = type && inputTypeValue?.isMulti
						const connectOn = inputTypeValue?.connectOn
						const disabled =
							dependsOn &&
							!dependsValue.includes(searchParams.get(`${dependsOn}Dependency`))

						let defaultDate = ''

						if (type === 'date') {
							if (
								(data && data[value]) ||
								(initialValue && initialValue[value])
							) {
								const date =
									data && data[value]
										? new Date(data[value])
										: new Date(initialValue[value])
								defaultDate = dateConvertForInput(date)
							}
						}

						if (connectOn) {
							if (value.endsWith('_id')) {
								return (
									<input
										key={index}
										type="hidden"
										name={value}
										value={
											data
												? data[connectOn]
													? data[connectOn]['id']
													: undefined
												: undefined
										}
									/>
								)
							}
						}

						if (fixedData && fixedData[value]) {
							if (dependsOn && !dependStateValue) {
								setDependStateValue((prevValue: any) => ({
									...prevValue,
									[dependsOn]: dependsValue,
								}))
							}
							return (
								<div key={index} className="mb-5">
									<Label>{replaceUnderscore(value)}</Label>
									<p className="mt-0.5 cursor-not-allowed rounded-sm border border-muted-foreground bg-muted p-2 text-sm text-gray-500">
										{fixedData[value][label]}
									</p>
									<input
										type="hidden"
										name={name}
										value={fixedData[value]['id']}
									/>
								</div>
							)
						}

						if (type === 'select') {
							if (isMulti) {
								return (
									<SelectorField
										key={fields[value].key ?? index}
										label={label}
										name={name}
										list={
											dependStateValue && dependStateValue[name]
												? list[name].filter((item: any) =>
														dependStateValue[name].includes(item[value]),
													)
												: list[name]
										}
										defaultValue={
											dependStateValue
												? dependStateValue[name] && dependStateValue[name][0]
												: data && data[value]
													? data[value]
													: initialValue[value]
										}
										buttonReset={resetButtonRef}
										errors={fields[value].errors}
									/>
								)
							}

							return (
								<RadioField
									key={fields[value].key ?? index}
									label={label}
									name={name}
									list={
										dependStateValue && dependStateValue[name]
											? list[name].filter((item: any) =>
													dependStateValue[name].includes(item[label]),
												)
											: list[name]
									}
									defaultValue={
										dependStateValue && dependStateValue[name]
											? dependStateValue[name][0]
											: data && data[value] && data[value][label]
												? data[value][label]
												: initialValue[value]
									}
									buttonReset={resetButtonRef}
									errors={fields[value].errors}
									dependent={dependant}
									onChange={(e: any) => {
										if (dependency) {
											searchParams.set(name + 'Dependency', e.target.value)
											setSearchParams(searchParams)
										} else if (dependant) {
											searchParams.set(
												name + 'Dependency',
												list[name].find(
													(item: any) => item.id === e.target.value,
												).name,
											)
											setSearchParams(searchParams)
										}
									}}
									disabled={disabled}
								/>
							)
						}
						if (type === 'radio') {
							return (
								<RadioField
									key={fields[value].key ?? index}
									label={label}
									name={name}
									list={
										dependStateValue && dependStateValue[name]
											? list[name].filter((item: any) =>
													dependStateValue[name].includes(item[label]),
												)
											: list[name]
									}
									dependent={dependant}
									defaultValue={
										dependStateValue && dependStateValue[name]
											? dependStateValue[name][0]
											: data && data[value]
												? data[value]
												: initialValue[value]
									}
									onChange={(e: any) => {
										if (dependency) {
											searchParams.set(name + 'Dependency', e.target.value)
											setSearchParams(searchParams)
										} else if (dependant) {
											searchParams.set(name + 'Dependency', e.target.value)
											setSearchParams(searchParams)
										}
									}}
									buttonReset={resetButtonRef}
									errors={fields[value].errors}
									disabled={disabled}
									isNotId={true}
								/>
							)
						}
						if (type === 'textarea') {
							return (
								<TextareaField
									key={fields[value].key ?? index}
									labelProps={{ children: replaceUnderscore(value) }}
									textareaProps={{
										...getTextareaProps(fields[value]),
										autoFocus: index === 0,
										defaultValue:
											data && data[value] ? data[value] : initialValue[value],
										placeholder: `Enter ${replaceUnderscore(value)}`,
									}}
									errors={fields[value].errors}
								/>
							)
						}
						return (
							<Field
								key={fields[value].key ?? index}
								labelProps={{ children: replaceUnderscore(value) }}
								inputProps={{
									...getInputProps(fields[value], {
										type: type ?? 'text',
									}),
									autoFocus: index === 0,
									defaultValue:
										type === 'file'
											? ''
											: type === 'date'
												? defaultDate
												: data
													? connectOn
														? data[connectOn] && data[connectOn][value]
														: data[value]
															? data[value]
															: initialValue[value]
													: initialValue[value],
									placeholder: `Enter ${replaceUnderscore(value)}`,
								}}
								errors={fields[value].errors}
							/>
						)
					})}

					<div className="mt-4 flex justify-end gap-3">
						<Button
							ref={resetButtonRef}
							type="reset"
							variant="accent"
							className="w-full"
							{...form.reset.getButtonProps()}
						>
							Reset
						</Button>
						<Button
							form={form.id}
							type="submit"
							variant="secondary"
							className="w-full"
						>
							Submit
						</Button>
					</div>
				</Form>
			</FormProvider>
		</Modal>
	)
}

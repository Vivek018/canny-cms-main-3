import { cn, getYears, months } from '@/utils/misx'
import { DetailsSelector } from './filter-selector'

export function ExtraFilter({
	searchParam,
	setSearchParam,
	companyList,
	projectList,
	month,
	year,
}: {
	searchParam: URLSearchParams
	setSearchParam: (searchParam: URLSearchParams) => void
	companyList: any
	projectList: any
	month: string
	year: string
}) {
  	const monthList = months
		const yearList = getYears(10)

	return (
		<>
			<DetailsSelector
				label="id"
				list={companyList}
				name="company"
				defaultValue={month}
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('company', e.target.value)
						: searchParam.delete('company')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				showLabel="name"
				className={cn('w-min', !companyList && 'hidden')}
				length={15}
			/>
			<DetailsSelector
				label="id"
				list={projectList}
				name="project"
				defaultValue={month}
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('project', e.target.value)
						: searchParam.delete('project')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				showLabel="name"
				className={cn('w-min', !projectList && 'hidden')}
				length={15}
			/>
			<DetailsSelector
				label="value"
				list={monthList}
				name="month"
				defaultValue={month}
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('month', e.target.value)
						: searchParam.delete('month')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				noNone={true}
				showLabel="label"
				className={cn('w-min', !monthList && 'hidden')}
				triggerClassName="w-[130px]"
			/>
			<DetailsSelector
				label="value"
				list={yearList}
				name="year"
				defaultValue={year}
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('year', e.target.value)
						: searchParam.delete('year')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				noNone={true}
				className={cn('w-min', !yearList && 'hidden')}
				triggerClassName="w-22"
			/>
		</>
	)
}

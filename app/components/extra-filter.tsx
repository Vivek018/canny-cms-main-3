import { cn, getYears, months } from '@/utils/misx'
import { DetailsSelector } from './filter-selector'

export function ExtraFilter({
	searchParam,
	setSearchParam,
	companyList,
	projectList,
	projectLocationList,
	month,
	year,
}: {
	searchParam: URLSearchParams
	setSearchParam: (searchParam: URLSearchParams) => void
	companyList?: any
	projectList?: any
	projectLocationList?: any
	month?: string
	year?: string
}) {
	const monthList = month ? months : null
	const yearList = year ? getYears(10) : null

	return (
		<div className='flex gap-2.5 items-center'>
			<DetailsSelector
				label="id"
				list={companyList}
				name="company"
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('company', e.target.value)
						: searchParam.delete('company')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				showLabel="name"
				className={cn('w-min', !companyList && 'hidden')}
			/>
			<DetailsSelector
				label="id"
				list={projectList}
				name="project"
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('project', e.target.value)
						: searchParam.delete('project')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				showLabel="name"
				className={cn('w-min', !projectList && 'hidden')}
			/>
			<DetailsSelector
				label="id"
				list={projectLocationList}
				name="project_location"
				onChange={(e: any) => {
					e.target.value && e.target.value !== 'none'
						? searchParam.set('project_location', e.target.value)
						: searchParam.delete('project_location')
					setSearchParam(searchParam)
				}}
				noLabel={true}
				showLabel="district"
				className={cn('w-min', !projectLocationList && 'hidden')}
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
				popClassName="w-28 right-0"
			/>
		</div>
	)
}

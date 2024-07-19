import { Link } from '@remix-run/react'
import { singleRouteName } from '@/constant'
import {
	capitalizeAfterUnderscore,
	cn,
	formatString,
	hasId,
	replaceUnderscore,
} from '@/utils/misx'

type DetailsDataProps = {
	className?: string
	keys: any
	imageField: any
	data: any
}

export function DetailsData({
	className,
	keys,
	imageField,
	data,
}: DetailsDataProps) {
	return (
		<div className={cn('my-10 grid grid-cols-3 gap-10', className)}>
			{keys.map((val: any) => {
				if (
					val === imageField ||
					data![val] === undefined ||
					data![val] === null
				)
					return null
				if (typeof data![val] === 'object') {
					let masterOfVal = null
					for (const key in singleRouteName) {
						if (singleRouteName[key] === capitalizeAfterUnderscore(val)) {
							masterOfVal = key
						}
					}
					return Object.keys(data![val]).map((key, index) => {
						if (
							hasId(key) ||
							key === 'created_at' ||
							key === 'updated_at' ||
							key === imageField
						)
							return null
						return (
							<div
								key={val + index}
								className={cn(
									'flex flex-col capitalize',
									!data[val][key] && 'hidden',
								)}
							>
								<h3 className="text-sm text-foreground/60">
									{replaceUnderscore(val) + ' - ' + replaceUnderscore(key)}
								</h3>
								{masterOfVal ? (
									<Link
										to={`/${masterOfVal}/${data[val].id}`}
										className="text-lg tracking-wide underline-offset-4 hover:underline"
									>
										{formatString(data![val][key])}
									</Link>
								) : (
									<p className="text-lg tracking-wide">
										{formatString(data![val][key])}
									</p>
								)}
							</div>
						)
					})
				} else if (
					val.includes('description') ||
					val.includes('address') ||
					val.includes('details')
				) {
					return (
						<div key={val} className="flex flex-col">
							<h3 className="text-sm capitalize text-foreground/60">
								{replaceUnderscore(val)}
							</h3>
							<p className={cn('text-lg tracking-wide')}>{data![val]}</p>
						</div>
					)
				} else {
					return (
						<div key={val} className="flex flex-col">
							<h3 className="text-sm capitalize text-foreground/60">
								{replaceUnderscore(val)}
							</h3>
							<p className={cn('text-lg tracking-wide')}>
								{formatString(data![val])}
							</p>
						</div>
					)
				}
			})}
		</div>
	)
}

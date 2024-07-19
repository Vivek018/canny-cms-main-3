import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { Field } from '@/components/forms'
import { dateConvertForInput } from './misx'

export const letterTypesInputList: { [key: string]: any } = {
	employees: {
		unprofessional_behaviour: () => {
			const prefix = 'unprofessional_behaviour'
			return (
				<>
					<Field
						labelProps={{
							children: 'unprofessional behaviour context',
						}}
						inputProps={{
							name: `${prefix}_context`,
						}}
					/>
					<Field
						labelProps={{
							children: 'Date',
						}}
						inputProps={{
							name: `${prefix}_date`,
							type: 'date',
							defaultValue: dateConvertForInput(new Date()),
						}}
					/>
				</>
			)
		},
		leave_without_information: () => {
			const prefix = 'leave_without_information'
			return (
				<>
					<Field
						labelProps={{
							children: 'Start Date',
						}}
						inputProps={{
							name: `${prefix}_start_date`,
							type: 'date',
						}}
					/>
					<Field
						labelProps={{
							children: 'End Date',
						}}
						inputProps={{
							name: `${prefix}_end_date`,
							type: 'date',
							defaultValue: dateConvertForInput(new Date()),
						}}
					/>
				</>
			)
		}, 
    offer: null,
    recommendation: null,
		negligence: null,
    pay_slip: null,
	},
	advances: {
		bill: <></>,
	},
	project_locations: {
		pay_slips: <></>,
		payment_data: <></>,
		bonus_list: <></>,
		retrenchment_list: <></>,
		gratuity_list: <></>,
		lwf_list: <></>,
		payment_bill: <></>,
		advance_bill: <></>,
	},
}

export const generateEnabledList = Object.keys(letterTypesInputList).reduce(
	(acc: { [key: string]: string[] }, key) => {
		acc[key] = Object.keys(letterTypesInputList[key])
		return acc
	},
	{},
)

export const styles = () =>
	StyleSheet.create({
		page: {
			backgroundColor: '#ffffff',
			color: 'black',
			paddingVertical: 60,
			paddingHorizontal: 30,
			fontSize: 12,
			lineHeight: 1.6,
		},
		header: {
			marginBottom: 30,
		},
		companyName: {
			fontSize: 16,
			fontWeight: 'bold',
			marginBottom: 5,
		},
		companyAddress: {
			fontSize: 10,
			marginBottom: 5,
		},
		point: {
			marginBottom: 10,
		},
		section: {
			marginBottom: 20,
		},
		signature: {
			marginTop: 40,
			fontSize: 12,
		},
		footer: {
			marginTop: 30,
			borderTopWidth: 1,
			borderTopColor: '#000000',
			borderTopStyle: 'solid',
			paddingTop: 10,
			fontSize: 10,
			textAlign: 'center',
		},
	})

export const pdfTemplates = {
	unprofessional_behaviour: (data: any) => (
		<>
			<View
				style={{
					...styles().section,
					alignSelf: 'center',
				}}
			>
				<Text style={{ textDecoration: 'underline', fontSize: 14 }}>
					Notice of Unprofessional Behaviour
				</Text>
			</View>
			<View style={styles().section}>
				<Text style={styles().point}>Dear {data.full_name},</Text>
				<Text style={styles().point}>
					It has come to our knowledge that you{' '}
					{data.unprofessional_behaviour_context} on{' '}
					{new Date(data.unprofessional_behaviour_date).toLocaleDateString()}.
					We want to emphasize that this behavior is neither expected nor
					tolerated at our company.
				</Text>
				<Text style={styles().point}>
					Please take this warning letter seriously; we do not entertain company
					policy violations. We expect you to apologize and improve your
					behavior, and furnish a written apology within three days.
				</Text>
				<Text>
					If you choose not to submit the apology or commit the mistake again,
					we may be forced to take stricter actions, including but not limited
					to suspension and termination.
				</Text>
			</View>
		</>
	),
	leave_without_information: (data: any) => (
		<>
			<View
				style={{
					...styles().section,
					alignSelf: 'center',
				}}
			>
				<Text style={{ textDecoration: 'underline', fontSize: 14 }}>
					Notice of Leave Without Information
				</Text>
			</View>
			<View style={styles().section}>
				<Text style={styles().point}>Dear {data.full_name},</Text>
				<Text style={styles().point}>
					I am writing to address your unauthorized absence from work without
					prior approval. It has been observed that you were absent from{' '}
					{new Date(
						data.leave_without_information_start_date,
					).toLocaleDateString()}{' '}
					to{' '}
					{new Date(
						data.leave_without_information_end_date,
					).toLocaleDateString()}{' '}
					without providing any explanation or seeking leave approval.
				</Text>
				<Text style={styles().point}>
					We consider this behavior a serious violation of company policy and
					detrimental to our operations. We expect all employees to adhere to
					our attendance policies and communicate any absences in advance.
				</Text>
				<Text>
					Failure to do so disrupts our workflow and hampers productivity. You
					are hereby issued a formal warning. Please provide a written
					explanation for your absence within three days from the date issued.
					Failure to comply may result in further disciplinary action.
				</Text>
			</View>
		</>
	),
	offer: (data: any) => (
		<View style={styles().page}>
			<View style={styles().header}>
				<Text style={styles().companyName}>[Company Name]</Text>
				<Text style={styles().companyAddress}>[Company Address]</Text>
			</View>
			<View style={styles().section}>
				<Text>Date: {new Date().toLocaleDateString()}</Text>
				<Text>To,</Text>
				<Text>{data.name}</Text>
				<Text>Address: {data.permanent_address}</Text>
			</View>
			<View style={styles().section}>
				<Text>Subject: Offer of Employment</Text>
			</View>
			<View style={styles().section}>
				<Text>Dear {data.full_name},</Text>
				<Text>
					We are delighted to extend to you this offer of employment for the
					position of {data.designation} at. We are confident that your skills
					and experience will be an ideal fit for our team.
				</Text>
				<Text>Your start date will be {data.startDate}.</Text>
				<Text>Your annual salary will be {data.salary}.</Text>
				<Text>
					Please sign and return this letter by {data.responseDate} to confirm
					your acceptance of this offer.
				</Text>
			</View>
			<View style={styles().signature}>
				<Text>Sincerely,</Text>
				<Text>[Your Name]</Text>
				<Text>[Your Position]</Text>
				<Text>[Company Name]</Text>
			</View>
			<View style={styles().footer}>
				<Text>[Company Footer Information]</Text>
			</View>
		</View>
	),
	experience: (data: any) => (
		<View style={styles().page}>
			<View style={styles().header}>
				<Text style={styles().companyName}>[Company Name]</Text>
				<Text style={styles().companyAddress}>[Company Address]</Text>
			</View>
			<View style={styles().section}>
				<Text>To Whom It May Concern,</Text>
			</View>
			<View style={styles().section}>
				<Text>
					This is to certify that {data.name} was employed with us as a{' '}
					{data.position} from {data.startDate} to {data.endDate}. During their
					tenure, they demonstrated exemplary skills and dedication to their
					role.
				</Text>
				<Text>We wish them all the best in their future endeavors.</Text>
			</View>
			<View style={styles().signature}>
				<Text>Sincerely,</Text>
				<Text>[Your Name]</Text>
				<Text>[Your Position]</Text>
				<Text>[Company Name]</Text>
			</View>
			<View style={styles().footer}>
				<Text>[Company Footer Information]</Text>
			</View>
		</View>
	),
	termination: (data: any) => (
		<View style={styles().page}>
			<View style={styles().header}>
				<Text style={styles().companyName}>[Company Name]</Text>
				<Text style={styles().companyAddress}>[Company Address]</Text>
			</View>
			<View style={styles().section}>
				<Text>Date: {new Date().toLocaleDateString()}</Text>
				<Text>To,</Text>
				<Text>{data.name}</Text>
				<Text>Address: {data.address}</Text>
			</View>
			<View style={styles().section}>
				<Text>Subject: Termination of Employment</Text>
			</View>
			<View style={styles().section}>
				<Text>Dear {data.name},</Text>
				<Text>
					We regret to inform you that your employment with {data.companyName}{' '}
					is being terminated effective {data.terminationDate}.
				</Text>
				<Text>
					Please refer to the company's termination policy for further details.
				</Text>
			</View>
			<View style={styles().signature}>
				<Text>Sincerely,</Text>
				<Text>[Your Name]</Text>
				<Text>[Your Position]</Text>
				<Text>[Company Name]</Text>
			</View>
			<View style={styles().footer}>
				<Text>[Company Footer Information]</Text>
			</View>
		</View>
	),
	recommendation: (data: any) => (
		<View style={styles().page}>
			<View style={styles().header}>
				<Text style={styles().companyName}>[Company Name]</Text>
				<Text style={styles().companyAddress}>[Company Address]</Text>
			</View>
			<View style={styles().section}>
				<Text>To Whom It May Concern,</Text>
			</View>
			<View style={styles().section}>
				<Text>
					I am pleased to recommend {data.name} for any position in {data.field}
					. During their time at {data.companyName}, they consistently
					demonstrated exceptional skills and professionalism.
				</Text>
				<Text>
					I am confident that they will be an asset to any organization they
					join.
				</Text>
			</View>
			<View style={styles().signature}>
				<Text>Sincerely,</Text>
				<Text>[Your Name]</Text>
				<Text>[Your Position]</Text>
				<Text>[Company Name]</Text>
			</View>
			<View style={styles().footer}>
				<Text>[Company Footer Information]</Text>
			</View>
		</View>
	),
	pay_slip: (data: any) => (
		<View style={styles().page}>
			<View style={styles().header}>
				<Text style={styles().companyName}>[Company Name]</Text>
				<Text style={styles().companyAddress}>[Company Address]</Text>
			</View>
			<View style={styles().section}>
				<Text>Pay Slip for {data.month}</Text>
			</View>
			<View style={styles().section}>
				<Text>Employee Name: {data.name}</Text>
				<Text>Employee Code: {data.employeeCode}</Text>
				<Text>Designation: {data.position}</Text>
			</View>
			<View style={styles().section}>
				<Text>Salary: {data.salary}</Text>
				<Text>Deductions: {data.deductions}</Text>
				<Text>Net Pay: {data.netPay}</Text>
			</View>
			<View style={styles().footer}>
				<Text>[Company Footer Information]</Text>
			</View>
		</View>
	),
}

import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { useTranslation } from 'react-i18next'

interface DepartmentChartProps {
  data: Array<{ department: string; count: number }>
}

function DepartmentChart({ data }: DepartmentChartProps) {
  const { t } = useTranslation()
  const options: Highcharts.Options = {
    chart: { type: 'column', height: 300 },
    title: { text: '' },
    xAxis: { categories: data.map(({ department }) => department) },
    yAxis: {
      min: 0,
      title: { text: t('charts.numberOfEmployees') },
    },
    legend: { enabled: false },
    series: [
      {
        type: 'column',
        name: t('charts.employees'),
        data: data.map(({ count }) => count),
        color: '#3B82F6',
      },
    ],
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        {t('charts.employeesByDepartment')}
      </h3>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  )
}

export default DepartmentChart
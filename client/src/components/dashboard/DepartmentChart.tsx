import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

interface DepartmentChartProps {
  data: Array<{ department: string; count: number }>
}

function DepartmentChart({ data }: DepartmentChartProps) {
  const options: Highcharts.Options = {
    chart: { type: 'column', height: 300 },
    title: { text: '' },
    xAxis: { categories: data.map(({ department }) => department) },
    yAxis: {
      min: 0,
      title: { text: 'Number of Employees' },
    },
    legend: { enabled: false },
    series: [
      {
        type: 'column',
        name: 'Employees',
        data: data.map(({ count }) => count),
        color: '#3B82F6',
      },
    ],
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Employees by Department
      </h3>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  )
}

export default DepartmentChart
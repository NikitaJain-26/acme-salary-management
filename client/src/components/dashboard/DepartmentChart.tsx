import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official/dist/highcharts-react.min.js'
const HighchartsReactComponent = (HighchartsReact as any).default

const options: Highcharts.Options = {
  chart: {
    type: 'column',
    height: 300,
  },

  title: {
    text: '',
  },

  xAxis: {
    categories: [
      'Engineering',
      'HR',
      'Finance',
      'Marketing',
      'Sales',
      'Operations',
    ],
  },

  yAxis: {
    min: 0,
    title: {
      text: 'Number of Employees',
    },
  },

  legend: {
    enabled: false,
  },

  series: [
    {
      type: 'column',
      name: 'Employees',
      data: [3200, 450, 650, 1200, 2100, 2400],
      color: '#3B82F6',
    },
  ],
}

function DepartmentChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Employees by Department
      </h3>

      <HighchartsReactComponent
        highcharts={Highcharts}
        options={options}
      />
    </div>
  )
}

export default DepartmentChart
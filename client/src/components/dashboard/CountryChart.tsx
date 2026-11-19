import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official/dist/highcharts-react.min.js'

const HighchartsReactComponent = (HighchartsReact as any).default

const options: Highcharts.Options = {
  chart: {
    type: 'pie',
    height: 320,
  },

  title: {
    text: '',
  },

  tooltip: {
    pointFormat: '<b>{point.percentage:.1f}%</b>',
  },

  accessibility: {
    point: {
      valueSuffix: '%',
    },
  },

  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      showInLegend: true,
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.percentage:.1f}%',
      },
    },
  },

  series: [
    {
      type: 'pie',
      name: 'Employees',
      data: [
        { name: 'India', y: 3500 },
        { name: 'USA', y: 2500 },
        { name: 'UK', y: 1500 },
        { name: 'Germany', y: 1000 },
        { name: 'Others', y: 1500 },
      ],
    },
  ],
}

function CountryChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Employees by Country
      </h3>

      <HighchartsReactComponent
        highcharts={Highcharts}
        options={options}
      />
    </div>
  )
}

export default CountryChart
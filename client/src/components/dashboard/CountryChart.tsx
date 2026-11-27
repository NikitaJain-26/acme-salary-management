import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { useTranslation } from 'react-i18next'

interface CountryChartProps {
  data: Array<{ countryCode: string; count: number }>
}

function CountryChart({ data }: CountryChartProps) {
  const { t } = useTranslation()
  const options: Highcharts.Options = {
    chart: { type: 'pie', height: 320 },
    title: { text: '' },
    tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b>' },
    accessibility: { point: { valueSuffix: '%' } },
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
        name: t('charts.employees'),
        data: data.map(({ countryCode, count }) => ({
          name: countryCode,
          y: count,
        })),
      },
    ],
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        {t('charts.employeesByCountry')}
      </h3>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  )
}

export default CountryChart
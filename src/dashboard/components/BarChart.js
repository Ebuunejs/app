import React from 'react'
import { AreaChart, BarChart as Chart, Card, Flex, Switch, Title ,Subtitle} from "@tremor/react";

const chartdata = [
  {
    name: "Januar",
    "Umsatz in diesem Monat": 248,
  },
  {
    name: "Februar",
    "Umsatz in diesem Monat": 144,
  },
  {
    name: "März",
    "Umsatz in diesem Monat": 743,
  },
  {
    name: "April",
    "Umsatz in diesem Monat": 281,
  },
  {
    name: "Mai",
    "Umsatz in diesem Monat": 251,
  },
  {
    name: "Juni",
    "Umsatz in diesem Monat": 232,
  },
  {
    name: "Juli",
    "Umsatz in diesem Monat": 98,
  },
];

const valueFormatter = (number) => `$ ${new Intl.NumberFormat("us").format(number).toString()}`;


const BarChart = () => {
  return (
    <Card>
        <Title>Umsätze in diesem Jahr(2021)</Title>
        <Subtitle>
          Hier sieht man die Umsätze für das aktuelle Jahr für jeden Monat.
        </Subtitle>
        <Chart
          className="mt-6"
          data={chartdata}
          index="name"
          categories={["Umsatz in diesem Monat"]}
          colors={["cyan"]}
          valueFormatter={valueFormatter}
          yAxisWidth={48}
        />
  </Card>
  )
}
export default BarChart;

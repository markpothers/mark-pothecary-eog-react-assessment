import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ImageList from '@material-ui/core/ImageList';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from './CardHeader';
import InputSelect from './InputSelect';
import Chart from './Chart';

const useStyles = makeStyles({
  card: {
    margin: '50px 10%',
  },
  dataCard: {
    border: '1px black solid',
  },
  inline: {
    display: 'inline-block',
  },
  liveCard: {
    margin: '0px 10px 20px',
  },
});

export default ({
  data, options, selectedMetrics, setSelectedMetrics, loading,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader title="Select any parameter in the dropdown menu to display its recent history on the chart and see its current reading" />
      <CardContent>
        <InputSelect
          options={options}
          selectedMetrics={selectedMetrics}
          setSelectedMetrics={setSelectedMetrics}
        />
        <ImageList sx={{ width: window.innerWidth * 0.76, height: 75 }} cols={7} rowHeight={65}>
          {selectedMetrics.map(metric => (
            <Card key={metric} className={classes.liveCard}>
              <CardContent>
                {metric}: {data.length > 0 ? `${data[data.length - 1][metric]} ${data[data.length - 1][`${metric}-unit`]}` : 0}
              </CardContent>
            </Card>
          ))}
        </ImageList>
        {loading && <LinearProgress />}
        <Chart
          data={data}
          selectedMetrics={selectedMetrics}
        />
      </CardContent>
      <CardHeader title="We hope this data is useful!" />
    </Card>
  );
};

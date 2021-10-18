import React from 'react';
import Card from '@material-ui/core/Card';
// import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from './CardHeader';
import InputSelect from './InputSelect';
import Chart from './Chart';
// import Avatar from './Avatar';

const useStyles = makeStyles({
  card: {
    margin: '5% 10%',
  },
  // inputSelect: {
  //   marginLeft: 'auto',
  // },
  dataCard: {
    border: '1px black solid',
  },
  inline: {
    display: 'inline-block',
  },
});

export default ({
  data, options, selectedMetrics, setSelectedMetrics, loading,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader title="Select any parameter in the dropdown menu to display its recent history on the chart" />
      <CardContent>
        <div className={classes.inline}>
          <InputSelect
            options={options}
            selectedMetrics={selectedMetrics}
            setSelectedMetrics={setSelectedMetrics}
          />
          {selectedMetrics.map(metric => (
            <Card key={metric}>
              <CardContent>
                {metric}: {data.length > 0 ? `${data[data.length - 1][metric]} ${data[data.length - 1][`${metric}-unit`]}` : 0}
              </CardContent>
            </Card>
          ))}
        </div>
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

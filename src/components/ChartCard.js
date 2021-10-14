import React from 'react';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from './CardHeader';
import InputSelect from './InputSelect';
import Chart from './Chart';
// import Avatar from './Avatar';

const useStyles = makeStyles({
  card: {
    margin: '5% 10%',
  },
});

export default () => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardHeader title="Select any parameter in the dropdown menu to display its recent history on the chart" />
      <CardContent>
        <InputSelect />
        <Chart />
        <Typography variant="body1">
          We hope the data is useful!
        </Typography>
      </CardContent>
    </Card>
  );
};

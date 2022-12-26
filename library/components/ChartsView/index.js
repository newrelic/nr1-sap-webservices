import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  CardHeader,
  ChartGroup,
  LineChart,
  Dropdown,
  DropdownItem
} from 'nr1';

import { HISTORY_TIMES } from '../../constants/times';
import { COLORS } from '../../constants/colors';

const ChartsView = ({
  history,
  historyTimeIndex,
  updateHistoryTime,
  traces,
  transports,
  logs,
  selectedWebService,
  eventsTimes
}) => {
  const [historyTime, setHistoryTime] = useState('');
  const [tracesChartData, setTracesChartData] = useState();
  const [transportsChartData, setTransportsChartData] = useState();
  const [logsChartData, setLogsChartData] = useState();

  useEffect(() => {
    const { display } = HISTORY_TIMES[historyTimeIndex];
    setHistoryTime(display);

    const historyEvents = selectedWebService ? [selectedWebService] : history;
    const historyEventsData = historyEvents.map(
      ({ timestamp, STATUS_GROUP }, i) => ({
        metadata: {
          id: `status${i}`,
          name: `WebService in status ${STATUS_GROUP}`,
          color: COLORS[STATUS_GROUP],
          viz: 'event'
        },
        data: [{ x0: timestamp, x1: timestamp }]
      })
    );
    const eventsData = {
      metadata: {
        id: 'events-window',
        name: 'Events window',
        color: COLORS.HISTORY,
        viz: 'event'
      },
      data:
        eventsTimes && eventsTimes.length === 2
          ? [{ x0: eventsTimes[0], x1: eventsTimes[1] }]
          : []
    };

    const chartMeta = {
      viz: 'main',
      units_data: {
        x: 'TIMESTAMP',
        y: 'COUNT'
      }
    };

    setTracesChartData([
      {
        metadata: {
          id: 'traces',
          name: 'Traces',
          color: COLORS.TRACES,
          ...chartMeta
        },
        data: traces.map(trace => ({
          x: (trace.beginTimeSeconds + trace.endTimeSeconds) / 0.002,
          y: trace.count
        }))
      },
      eventsData,
      ...historyEventsData
    ]);

    setTransportsChartData([
      {
        metadata: {
          id: 'transports',
          name: 'Transports',
          color: COLORS.TRANSPORTS,
          ...chartMeta
        },
        data: transports.map(transport => ({
          x: (transport.beginTimeSeconds + transport.endTimeSeconds) / 0.002,
          y: transport.count
        }))
      },
      eventsData,
      ...historyEventsData
    ]);

    setLogsChartData([
      {
        metadata: {
          id: 'logs',
          name: 'Logs',
          color: COLORS.LOGS,
          ...chartMeta
        },
        data: logs.map(log => ({
          x: (log.beginTimeSeconds + log.endTimeSeconds) / 0.002,
          y: log.count
        }))
      },
      eventsData,
      ...historyEventsData
    ]);
  }, [
    history,
    historyTimeIndex,
    traces,
    transports,
    logs,
    selectedWebService,
    eventsTimes
  ]);

  return (
    <div>
      <div>
        <Dropdown
          className="charts-time-filter"
          title={`Chart Data: ${historyTime}`}
        >
          {HISTORY_TIMES.map((period, i) => (
            <DropdownItem key={i} onClick={() => updateHistoryTime(i)}>
              {period.display}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
      <div className="charts-view">
        <ChartGroup>
          <Card>
            <CardHeader
              title="Transaction Traces (WebService specific)"
              subtitle={historyTime}
            />
            <CardBody>
              {tracesChartData ? (
                <LineChart data={tracesChartData} fullWidth />
              ) : null}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Log Entries (General)" subtitle={historyTime} />
            <CardBody>
              {logsChartData ? (
                <LineChart data={logsChartData} fullWidth />
              ) : null}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Transports (General)" subtitle={historyTime} />
            <CardBody>
              {transportsChartData ? (
                <LineChart data={transportsChartData} fullWidth />
              ) : null}
            </CardBody>
          </Card>
        </ChartGroup>
      </div>
    </div>
  );
};

ChartsView.propTypes = {
  history: PropTypes.array,
  historyTimeIndex: PropTypes.number,
  updateHistoryTime: PropTypes.func,
  traces: PropTypes.array,
  transports: PropTypes.array,
  logs: PropTypes.array,
  selectedWebService: PropTypes.object,
  eventsTimes: PropTypes.array
};

export default ChartsView;

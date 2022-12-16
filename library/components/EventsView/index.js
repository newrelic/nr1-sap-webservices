import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Dropdown,
  navigation,
  NerdGraphQuery,
  ngql as gql,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  Toast
} from 'nr1';
import { COLORS } from '../../constants/colors';
import { EVENTS_TIMES } from '../../constants/times';
import { EVENTS_TYPES } from '../../constants/types';
import { formatEventTime, formatHeaderTime } from '../../utils/times';

const EventsView = ({
  accountId,
  webService,
  selectedWebService,
  eventsTimes,
  eventsTimeIndex,
  updateEventsTimeIndex
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState(
    EVENTS_TYPES.reduce(
      (types, type) => ({
        ...types,
        [type.type]: { type: type.display, selected: true }
      }),
      {}
    )
  );

  useEffect(() => {
    if (!eventsTimes) return;
    const loadEvents = async () => {
      const [minTime, maxTime] = eventsTimes;
      const queryTime =
        maxTime > minTime
          ? `SINCE ${minTime} UNTIL ${maxTime}`
          : `SINCE ${minTime}`;
      const queryFilters = `WHERE instrumentation.provider = 'SAP' AND SYS_ID = '${webService.sysId}'`;
      const queryLimit = 'LIMIT MAX';

      // const historyQuery = `SELECT * FROM NR_SAP_INTEGRATION_SERVICE WHERE Interface = '${webService.interface}' AND SYS_ID = '${webService.sysId}' ${queryTime} ${queryLimit}`;
      /* ### TEST NRQL */ const historyQuery = `SELECT * FROM NR_SAP_INTEGRATION_SERVICE WHERE Interface = '${webService.interface}' AND SYS_ID = '${webService.sysId}' ${queryTime} ${queryLimit}`;

      // const transportsQuery = `SELECT * FROM NR_SAP_TRANSPORT ${queryFilters} ${queryTime} ${queryLimit}`;
      /* ### TEST NRQL */ const transportsQuery = `SELECT * FROM NR_SAP_TRANSPORT ${queryFilters} since 3 days ago ${queryLimit}`;

      // const logsQuery = `SELECT * FROM Log ${queryFilters} AND (EXTNUMBER LIKE '%${webService.messageId}%' OR MESSAGES LIKE '%${webService.messageId}%') ${queryTime} ${queryLimit}`;
      /* ### TEST NRQL */ const logsQuery = `SELECT * FROM Log ${queryFilters} since 3 days ago ${queryLimit}`;

      // const tracesQuery = `SELECT * FROM Span WHERE ROOT_CONTEXT_ID = '${webService.rootContextId ||
      //  ''}' AND Transaction_ID = '${webService.rootContextId ||
      //  ''} ${queryTime} ${queryLimit}`;
      /* ### TEST NRQL */ const tracesQuery = `SELECT * FROM Span WHERE ROOT_CONTEXT_ID = '${webService.rootContextId ||
        /* ### TEST NRQL */ ''}' since 3 days ago ${queryLimit}`;

      const query = gql`
        query WebServicesQuery(
          $accounts: [Int!]!
          $historyQuery: Nrql!
          $tracesQuery: Nrql!
          $transportsQuery: Nrql!
          $logsQuery: Nrql!
        ) {
          actor {
            history: nrql(accounts: $accounts, query: $historyQuery) {
              results
            }
            traces: nrql(accounts: $accounts, query: $tracesQuery) {
              results
            }
            transports: nrql(accounts: $accounts, query: $transportsQuery) {
              results
            }
            logs: nrql(accounts: $accounts, query: $logsQuery) {
              results
            }
          }
        }
      `;

      const variables = {
        accounts: [accountId],
        historyQuery,
        tracesQuery,
        transportsQuery,
        logsQuery
      };

      setLoading(true);
      const {
        loading,
        data: { actor: res } = {},
        error
      } = await NerdGraphQuery.query({ query, variables });
      setLoading(loading);
      if (error) return;
      const evts = Object.keys(res).reduce((evts, evt) => {
        if (evt === '__typename') return evts;
        (res[evt].results || []).forEach(e => {
          const event = {
            ...e,
            eventType: evt,
            eventColor:
              COLORS[evt === 'history' ? e.STATUS_LIGHT : evt.toUpperCase()]
          };
          /* eslint-disable prefer-template */
          /* eslint-disable prettier/prettier */
            if (evt === 'history') {
            event.eventDescription =
              `${e.Processing_Status} ${e.Message_Status}.` +
              (e.Error_ID ? ` - error id: ${e.Error_ID}` : '') +
              (e.Error_Information ? ` - error info: ${e.Error_Information}` : '');
          }
          if (evt === 'logs') event.eventDescription = e.message;
          if (evt === 'transports')
            event.eventDescription = `Transport: ${e.TRANSPORT} by ${e.OWNER} imported.  Return Code: ${e.RETURN_CODE}`;
          if (evt === 'traces') {
            event.eventDescription =
              (e.FUNCTION_NAME ? `Trace span of ${e.FUNCTION_NAME}` : '') +
              (e.DESTINATION ? ` at ${e.DESTINATION}` : '') +
              (e['duration.ms'] ? `  duration: ${e['duration.ms']} ms.` : '.') +
              (e.PROGRAM_NAME ? ` Called by ${e.PROGRAM_NAME} at line ${e.PROGRAM_LINE}` : '');
            if (event.eventDescription === '.') event.eventDescription = '--';
          }
          /* eslint-enable prettier/prettier */
          /* eslint-enable prefer-template */
          if (!evts.length) {
            evts.push(event);
          } else {
            let sortIdx = 0;
            while (
              sortIdx < evts.length &&
              event.timestamp < evts[sortIdx].timestamp
            )
              sortIdx += 1;
            evts.splice(sortIdx, 0, event);
          }
        });
        return evts;
      }, []);
      setEvents(evts);
    };

    if (!loading) loadEvents();
  }, [accountId, webService, selectedWebService, eventsTimes, eventsTimeIndex]);

  const toggleType = type =>
    setEventTypes({
      ...eventTypes,
      [type]: {
        type: eventTypes[type].type,
        selected: !eventTypes[type].selected
      }
    });

  const filteredEvents = events.filter(
    evt => eventTypes[evt.eventType].selected
  );

  const selectedEventsCount = () => {
    const types = Object.keys(eventTypes);
    let selTypes = types.filter(type => eventTypes[type].selected).length;
    if (types.length === selTypes) return 'All event types';
    return `${selTypes} event type${--selTypes ? 's' : ''}`;
  };

  const tableActions = [
    {
      label: 'Show details',
      onClick: (_, { item }) => {
        switch(item.eventType) { // eslint-disable-line prettier/prettier
          case 'logs':
            navigation.openStackedNerdlet({
              id: 'logger.log-tailer',
              urlState: {
                accountId,
                query: `instrumentation.provider:SAP`,
                detailedLogId: item.messageId,
                eventType: ['Log'],
                timestamp: item.timestamp
              }
            });
            break;

          case 'traces':
            navigation.openStackedNerdlet({
              id: 'distributed-tracing-nerdlets.distributed-tracing-launcher',
              urlState: {
                accountId,
                query: `instrumentation.provider:SAP`,
                // query: `instrumentation.provider:SAP ROOT_CONTEXT_ID: ${item.ROOT_CONTEXT_ID} TRANSACTION_ID: ${item.TRANSACTION_ID}`,
                ROOT_CONTEXT_ID: '005056B10FE41ED8A583C8FB408CA12D',
                eventType: ['Span'],
                timestamp: item.timestamp
              }
            });
            break;

          default:
            Toast.showToast({
              title: 'No details available',
              description: 'Details for the event are not available currently'
            });
        }
      }
    }
  ];

  return (
    <div className="events-view">
      <Card>
        <CardHeader
          title="Events"
          subtitle={
            eventsTimes && eventsTimes.length === 2
              ? `${formatHeaderTime(eventsTimes[0])} - ${formatHeaderTime(
                  eventsTimes[1]
                )}`
              : ''
          }
        >
          <Dropdown
            title={`${selectedEventsCount()} within ${
              EVENTS_TIMES[eventsTimeIndex].display
            }`}
          >
            <div className="events-filters">
              <div className="time-filters">
                {EVENTS_TIMES.map((time, i) => (
                  <Checkbox
                    key={i}
                    onChange={() => updateEventsTimeIndex(i)}
                    label={time.display}
                    checked={i === eventsTimeIndex}
                  />
                ))}
              </div>
              <div className="events-filters-divider" />
              <div className="type-filters">
                {Object.keys(eventTypes).map((type, i) => (
                  <Checkbox
                    key={i}
                    onChange={() => toggleType(type)}
                    label={eventTypes[type].type}
                    checked={eventTypes[type].selected}
                  />
                ))}
              </div>
            </div>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <Table items={filteredEvents}>
            <TableHeader>
              <TableHeaderCell value={({ item }) => item.timestamp} width="15%">
                Timestamp
              </TableHeaderCell>
              <TableHeaderCell width="15%">Event Type</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
            </TableHeader>
            {({ item, index }) => (
              <TableRow key={index} actions={tableActions}>
                <TableRowCell
                  style={{
                    borderLeft: `5px solid ${
                      COLORS[item.eventType.toUpperCase()]
                    }`
                  }}
                >
                  {formatEventTime(item.timestamp)}
                </TableRowCell>
                <TableRowCell>{eventTypes[item.eventType].type}</TableRowCell>
                <TableRowCell>{item.eventDescription}</TableRowCell>
              </TableRow>
            )}
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

EventsView.propTypes = {
  accountId: PropTypes.number,
  webService: PropTypes.object,
  selectedWebService: PropTypes.object,
  eventsTimes: PropTypes.array,
  eventsTimeIndex: PropTypes.number,
  updateEventsTimeIndex: PropTypes.func
};

export default EventsView;

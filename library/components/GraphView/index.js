import React from 'react';
import PropTypes from 'prop-types';

import data from './data';
import { getPixels } from '../../utils/helpers';
// import OutboundLinks from './outbound-links';
// import InboundLinks from './inbound-links';

const GraphView = ({ height, width, webServices }) => {
  const { nodes, viewBox } = data;

  const colors = {
    yellow: '#FCCC0A',
    green: '#00933C',
    red: '#EE352E'
  };

  const fillColor = color => (color === 'yellow' ? 'black' : 'white');

  const statusCounts = webServices.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.statusGroup]: (acc[cur.statusGroup] || 0) + 1
    }),
    {}
  );

  const getXPosition = (str, fontSize) => {
    const strPixels = getPixels(str, fontSize);
    return Math.ceil((200 - strPixels) / 2);
  };

  return (
    <div className="statuses" style={{ width, height }}>
      <svg height="100%" viewBox={viewBox}>
        <title>SAP Integration Service Nerdlet</title>
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="SAP-Integration-Service-Nerdlet">
            <g id="nodes">
              {nodes.map((node, i) => (
                <g
                  id={node.name.toLowerCase()}
                  key={i}
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  <title>{node.disp}</title>
                  <ellipse
                    fill={colors[node.color]}
                    cx="100"
                    cy="150"
                    rx="100"
                    ry="40"
                  />
                  <text
                    fontFamily="sans-serif"
                    fontSize="20"
                    fontWeight="bold"
                    fill={fillColor(node.color)}
                    letterSpacing="0.5"
                  >
                    <tspan x={getXPosition(node.name, 20)} y="154">
                      {node.name}
                    </tspan>
                  </text>
                  {node.name in statusCounts ? (
                    <text
                      fontFamily="sans-serif"
                      fontSize="16"
                      fontWeight="bold"
                      fill={fillColor(node.color)}
                      letterSpacing="0.25"
                    >
                      <tspan
                        x={getXPosition(String(statusCounts[node.name]), 16)}
                        y="175"
                      >
                        {statusCounts[node.name]}
                      </tspan>
                    </text>
                  ) : null}
                </g>
              ))}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

GraphView.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  webServices: PropTypes.array
};

export default GraphView;

const data = {
  viewBox: '0 0 800 600',
  nodes: [
    {
      name: 'SUCCESSFUL',
      disp: 'Enterprise Integration Service was successful',
      color: 'green',
      x: 30,
      y: 20
    },
    {
      name: 'CANCELLED',
      disp: 'Enterprise Integration Service was cancelled',
      color: 'red',
      x: 280,
      y: 20
    },
    {
      name: 'ISOLATED',
      disp: 'Enterprise Integration Service is isolated',
      color: 'yellow',
      x: 30,
      y: 150
    },
    {
      name: 'ERROR',
      disp: 'Enterprise Integration Service errored out',
      color: 'red',
      x: 280,
      y: 150
    },
    {
      name: 'TRANSFERRED',
      disp: 'Enterprise Integration Service was transferred',
      color: 'green',
      x: 30,
      y: 280
    },
    {
      name: 'WAITING',
      disp: 'Enterprise Integration Service is waiting',
      color: 'yellow',
      x: 280,
      y: 280
    }
  ]
};

export default data;

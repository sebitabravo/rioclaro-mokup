import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const testData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 20 },
  { name: 'C', value: 15 },
  { name: 'D', value: 25 }
];

export function TestChart() {
  return (
    <div style={{ width: '400px', height: '200px', border: '2px solid red', backgroundColor: '#fee' }}>
      <h3>Test Chart</h3>
      <p>Data: {JSON.stringify(testData)}</p>

      {/* Prueba 1: ResponsiveContainer */}
      <div style={{ width: '100%', height: '80px', border: '1px solid blue', marginBottom: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={testData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prueba 2: Dimensiones fijas */}
      <div style={{ border: '1px solid green' }}>
        <LineChart width={300} height={60} data={testData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Line type="monotone" dataKey="value" stroke="#ff0000" strokeWidth={2} />
        </LineChart>
      </div>
    </div>
  );
}
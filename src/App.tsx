import { useEffect, useState } from 'react';
import SmoothieComponent, { SmoothieComponentSeries, TimeSeries } from 'react-smoothie';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import mqtt from 'mqtt';
import 'react-circular-progressbar/dist/styles.css';
import { hide } from '@tauri-apps/api/app';

const client = mqtt.connect({
  host: 'test.mosquitto.org',
  port: 8081,
  protocol: 'wss'
});
client.on('connect', () => {
  console.log('connected');
  client.subscribe('triton', (err, g, p) => {
    console.log(err, g, p);
  });
});
client.on('message', function (topic, message) {
  const msg = message.toString();
  console.log(msg);
});

function XYGraph(props: any) {
  useEffect(() => {
    const interval = setInterval(() => {
      const data = (props.series[0].data).data;
      props.series[0].data.append(
        new Date().getTime(),
        data.length > 0 ? data[data.length - 1][1] + (Math.random() - 0.5) * 0.1 : 0
      );
      props.setVal(data.length > 0 ? data[data.length - 1][1] : 0);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={'flex items-center w-full justify-center bg-black/20 p-1 border border-white/20 rounded-lg ' + props.className}>
      <p className='-rotate-90 w-5 text-sm'>{props.yLabel}</p>
      <div className='flex flex-col w-full h-full items-center justify-center'>
        <p className='font-semibold text-lg pb-1'>{props.title} <span style={{
          color: props.series[0].strokeStyle
        }}>[{Math.abs(props.val)?.toFixed(2)}]</span></p>
        <SmoothieComponent
          className='h-full w-full'
          responsive
          series={props.series}
          style={{ width: '100%', height: '100%' }}
        />
        <p className='text-sm'>{props.xLabel}</p>
      </div>
    </div>
  );
}

const pressurent = new TimeSeries({});
const fuel = new TimeSeries({});
const oxidiser = new TimeSeries({});
const pressure1 = new TimeSeries({});
const pressure2 = new TimeSeries({});
const pressure3 = new TimeSeries({});
const thrust = new TimeSeries({});

function App() {
  const [pressurentVal, setPressurentVal] = useState(0);
  const [fuelVal, setFuelVal] = useState(0);
  const [oxidiserVal, setOxidiserVal] = useState(0);
  const [pressure1Val, setPressure1Val] = useState(0);
  const [pressure2Val, setPressure2Val] = useState(0);
  const [pressure3Val, setPressure3Val] = useState(0);
  const [thrustVal, setThrustVal] = useState(0);
  const [motorPerc, setMotorPerc] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      let v = parseInt(`${motorPerc + (Math.random() - 0.1) * 5}`);
      if (v < 0) v = 10;
      if (v > 100) v = 90;
      setMotorPerc(v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex flex-col items-center justify-around h-screen'>

      <div className="flex justify-between items-center text-white h-full p-2 px-10 max-h-[10vh] w-full">
        <img src="/public/Triton_Rocketry.png" alt="Tritan Logo Left" className='h-full p-2' />
        <div className="text-4xl font-bold tracking-wider font-sans">GROUND CONTROL STATION</div>
        <img src="Kalpana Chawla center logo.png" alt="Kalpana Chawala Center Logo" className='h-full' />
      </div>


      {/* Main Content */}
      <main className=" text-white/80 w-screen overflow-clip p-2 flex flex-col gap-2 px-10">
        <div className="flex gap-2">
          {/* Pressure Graphs */}
          <div className="w-1/2 grid grid-cols-3 grid-rows-2 gap-2">
            <XYGraph
              title="Pressure Tank"
              val={pressurentVal}
              setVal={setPressurentVal}
              xLabel="Time"
              yLabel="Pressure"
              series={[
                {
                  data: pressurent,
                  strokeStyle: "rgb(255, 255, 0)",
                  fillStyle: "rgba(255, 255, 0, 0.4)",
                  lineWidth: 2,
                },
              ]}
              height={150}
            />
            <XYGraph
              title="Fuel Tank"
              val={fuelVal}
              setVal={setFuelVal}
              xLabel="Time"
              yLabel="Pressure"
              series={[
                {
                  data: fuel,
                  strokeStyle: "rgb(134, 239, 172)",
                  fillStyle: "rgba(134, 239, 172, 0.4)",
                  lineWidth: 2,
                },
              ]}
              height={150}
            />
            <XYGraph
              title="Oxidiser"
              val={oxidiserVal}
              setVal={setOxidiserVal}
              xLabel="Time"
              yLabel="Pressure"
              series={[
                {
                  data: oxidiser,
                  strokeStyle: "rgb(147, 197, 253)",
                  fillStyle: "rgba(147, 197, 253, 0.4)",
                  lineWidth: 2,
                },
              ]}
              height={150}
            />
            <XYGraph
              title="Pressure 1"
              val={pressure1Val}
              setVal={setPressure1Val}
              xLabel="Time"
              yLabel="Pressure"
              series={[
                {
                  data: pressure1,
                  strokeStyle: "rgb(255, 99, 71)",
                  fillStyle: "rgba(255, 99, 71, 0.4)",
                  lineWidth: 2,
                },
              ]}
              height={150}
            />
            <XYGraph
              title="Pressure 2"
              val={pressure2Val}
              setVal={setPressure2Val}
              xLabel="Time"
              yLabel="Pressure"
              series={[
                {
                  data: pressure2,
                  strokeStyle: "rgb(173, 216, 230)",
                  fillStyle: "rgba(173, 216, 230, 0.4)",
                  lineWidth: 2,
                },
              ]}
              height={150}
            />
            <XYGraph
              title="Pressure 3"
              val={pressure3Val}
              setVal={setPressure3Val}
              xLabel="Time"
              yLabel="Pressure"
              series={[
                {
                  data: pressure3,
                  strokeStyle: "rgb(173, 216, 230)",
                  fillStyle: "rgba(154, 167, 35, 0.4)",
                  lineWidth: 2,
                },
              ]}
              height={150}
            />
          </div>
          <div className="flex flex-col w-1/2 gap-4 rounded-lg items-center justify-center">
            <div className="!w-full h-full flex flex-col items-center justify-center">
              <XYGraph
                title="Thrust"
                className='h-full w-full'
                val={thrustVal}
                setVal={setThrustVal}
                width="100%" // Makes the graph take the full width of the container
                height={330} // Makes the graph take the full height of the container
                xLabel="Time"
                yLabel="Thrust"
                series={[
                  {
                    data: thrust,
                    strokeStyle: "rgb(255, 150, 150)",
                    fillStyle: "rgba(255, 150, 150, 0.4)",
                    lineWidth: 2,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Motor Circular Graphs */}
        <div className="flex gap-5 justify-around mt-4">
          <div className='flex gap-5'>
            {[motorPerc, motorPerc + 10, motorPerc - 10, motorPerc + 15, motorPerc - 5].map(
              (percentage, index) => (
                <CircularProgressbarWithChildren
                  key={index}
                  value={percentage}
                  className="w-36 h-36"
                  circleRatio={0.75}
                  styles={buildStyles({
                    rotation: 1 / 2 + 1 / 8,
                    strokeLinecap: "butt",
                    textSize: "20px",
                    pathColor: `rgba(${255 - percentage}, ${percentage}, 0, 1)`,
                    textColor: `rgba(${255 - percentage}, ${percentage}, 0, 1)`,
                    trailColor: "transparent",
                  })}
                >
                  <div className="text-xs font-semibold">
                    <p>Motor {index + 1}</p>
                    <p>{percentage}%</p>
                  </div>
                </CircularProgressbarWithChildren>
              )
            )}
          </div>
          <div className=' flex gap-5'>
            {/* add 5 led lights with labels */}
            <div className='flex flex-col items-center justify-center'>
              <div className='w-10 h-10 bg-red-500 rounded-full'></div>
              <p>led 1</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <div className='w-10 h-10 bg-green-500 rounded-full'></div>
              <p>led 1</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <div className='w-10 h-10 bg-red-500 rounded-full'></div>
              <p>led 1</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <div className='w-10 h-10 bg-green-500 rounded-full'></div>
              <p>led 1</p>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
export default App;

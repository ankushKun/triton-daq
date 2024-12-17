import { useEffect, useState } from 'react';
import SmoothieComponent, { SmoothieComponentSeries, TimeSeries } from 'react-smoothie';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function XYGraph(props: { title: string, height?: number, xLabel: string, yLabel: string, series: SmoothieComponentSeries[], val: number, setVal: React.Dispatch<React.SetStateAction<any>> }) {
  useEffect(() => {
    const interval = setInterval(() => {
      const data = (props.series[0].data as any).data as [number, number][];
      props.series[0].data.append(new Date().getTime(), data.length > 0 ? data[data.length - 1][1] + (Math.random() - 0.5) * 0.1 : 0);
      props.setVal(data.length > 0 ? data[data.length - 1][1] : 0);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex items-center justify-center bg-black/20 p-1 border border-white/20 rounded-lg'>
      <p className=' -rotate-90 w-5 text-sm'>{props.yLabel}</p>
      <div className='flex flex-col items-center justify-center'>
        <p className='font-semibold text-lg pb-1'>{props.title} <span style={{
          color: props.series[0].strokeStyle as string,
        }}>[{Math.abs(props.val)?.toFixed(2)}]</span></p>
        <SmoothieComponent
          className=''
          responsive
          height={props.height || 150}
          series={props.series}
        />
        <p className='text-sm'>{props.xLabel}</p>
      </div>
    </div>
  );
}

const pressurent = new TimeSeries({});
const fuel = new TimeSeries({});
const oxidiser = new TimeSeries({});
const thrust = new TimeSeries({});

function App() {
  const [pressurentVal, setPressurentVal] = useState<number>(0);
  const [fuelVal, setFuelVal] = useState<number>(0);
  const [oxidiserVal, setOxidiserVal] = useState<number>(0);
  const [thrustVal, setThrustVal] = useState<number>(0);
  const [motorPerc, setMotorPerc] = useState<number>(50);

  useEffect(() => {
    // + - motorPerc by random value
    const interval = setInterval(() => {
      let v = parseInt(`${motorPerc + (Math.random() - 0.1) * 5}`)
      if (v < 0) v = 10;
      if (v > 100) v = 90;
      setMotorPerc(v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-black/80 text-white/80 w-screen h-screen overflow-clip p-2 flex flex-col gap-2 justify-between">
      <div className='flex gap-2'>
        <div className='w-1/2 flex flex-col gap-2'>
          <XYGraph
            title={`Pressure tank`}
            val={pressurentVal}
            setVal={setPressurentVal}
            xLabel='Time' yLabel='Pressure' series={[{
              data: pressurent,
              strokeStyle: 'rgb(255, 255, 0)',
              fillStyle: 'rgba(255, 255, 0, 0.4)',
              lineWidth: 2
            }]} />
          <XYGraph
            title='Fuel tank'
            val={fuelVal}
            setVal={setFuelVal}
            xLabel='Time' yLabel='Pressure' series={[{
              data: fuel,
              strokeStyle: 'rgb(134, 239, 172)',
              fillStyle: 'rgba(134, 239, 172, 0.4)',
              lineWidth: 2
            }]} />
          <XYGraph
            title='Oxidiser'
            val={oxidiserVal}
            setVal={setOxidiserVal}
            xLabel='Time' yLabel='Pressure' series={[{
              data: oxidiser,
              strokeStyle: 'rgb(147, 197, 253)',
              fillStyle: 'rgba(147, 197, 253, 0.4)',
              lineWidth: 2
            }]} />
        </div>

        <div className='flex flex-col gap-4 w-1/2 rounded-lg'>
          <div className='bg-black/20 p-4 rounded-lg w-full h-full'></div>
          <div className='mx-auto flex gap-5 h-fit mt-auto'>
            <CircularProgressbarWithChildren value={motorPerc} className='w-52 h-52'
              circleRatio={0.75}
              styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: "butt",
                trailColor: "#eee",

              })} >
              motor 1<strong>{motorPerc}%</strong>
            </CircularProgressbarWithChildren>
            <CircularProgressbarWithChildren value={motorPerc + 10} className='w-52 h-52'
              circleRatio={0.75}
              styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: "butt",
                trailColor: "#eee",
              })} >
              motor 2<strong>{motorPerc + 10}%</strong>
            </CircularProgressbarWithChildren>
            <CircularProgressbarWithChildren value={motorPerc - 10} className='w-52 h-52'
              circleRatio={0.75}
              styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: "butt",
                trailColor: "#eee",

              })} >
              motor 3 <strong>{motorPerc - 10}%</strong>
            </CircularProgressbarWithChildren>
          </div>
        </div>

        {/* <div className='w-1/2 grow flex'>
          <div className='text-5xl h-full grid grid-rows-3 grid-flow-col justify-around items-center gap-7 w-full'>
            <p className='font-semibold text-yellow-300'>Pressure: {Math.abs(pressurentVal)?.toFixed(2)}</p>
            <p className='font-semibold text-green-300'>Fuel: {(Math.abs(fuelVal) * 100)?.toFixed(2)}</p>
            <p className='font-semibold text-blue-300'>Oxidiser: {(Math.abs(oxidiserVal) * 100)?.toFixed(2)}</p>
            <p className='font-semibold text-red-300'>Thrust: {(Math.abs(thrustVal) * 1000)?.toFixed(2)}</p>
          </div>
        </div> */}
      </div>
      <XYGraph
        title='Thrust'
        val={thrustVal}
        setVal={setThrustVal}
        height={200}
        xLabel='Time' yLabel='Thrust' series={[{
          data: thrust,
          strokeStyle: 'rgb(255, 150, 150)',
          fillStyle: 'rgba(255, 150, 150, 0.4)',
          lineWidth: 2
        }]} />
    </main>
  );
}

export default App;

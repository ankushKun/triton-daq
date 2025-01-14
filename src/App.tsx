import { useEffect, useState, useRef } from 'react';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
// import mqtt from 'mqtt';
import 'react-circular-progressbar/dist/styles.css';
// import { hide } from '@tauri-apps/api/app';


const server = 'ws://94.136.191.183:8080';

type Data = {
  pressureTank: number;
  fuel: number;
  oxidiser: number;
  pressure1: number;
  pressure2: number;
  pressure3: number;
  thrust: number;
  motor1: number;
  motor2: number;
  motor3: number;
}

function strToObj(str: string): Data {
  const nums = str.split(',').map(Number);

  return {
    pressureTank: nums[0],
    fuel: nums[1],
    oxidiser: nums[2],
    pressure1: nums[3],
    pressure2: nums[4],
    pressure3: nums[5],
    thrust: nums[6],
    motor1: nums[7],
    motor2: nums[8],
    motor3: nums[9],
  }
}
// console.log(strToObj("96.1,109.6,99.4,91.8,107.1,101.8,5.0,223.0,207.0,347.0"))

// const client = mqtt.connect({
//   host: 'test.mosquitto.org',
//   port: 8081,
//   protocol: 'wss'
// });
// client.on('connect', () => {
//   console.log('connected');
//   client.subscribe('triton', (err, g, p) => {
//     console.log(err, g, p);
//   });
// });
// client.on('message', function (topic, message) {
//   const msg = message.toString();
//   console.log(msg);
// });

function XYGraph(props: any) {
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const data = (props.series[0].data).data;
  //     props.series[0].data.append(
  //       new Date().getTime(),
  //       data.length > 0 ? data[data.length - 1][1] + (Math.random() - 0.5) * 0.1 : 0
  //     );
  //     props.setVal(data.length > 0 ? data[data.length - 1][1] : 0);
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, []);

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
const motor1 = new TimeSeries({});
const motor2 = new TimeSeries({});
const motor3 = new TimeSeries({});


function App() {
  const [pressurentVal, setPressurentVal] = useState(0);
  const [fuelVal, setFuelVal] = useState(0);
  const [oxidiserVal, setOxidiserVal] = useState(0);
  const [pressure1Val, setPressure1Val] = useState(0);
  const [pressure2Val, setPressure2Val] = useState(0);
  const [pressure3Val, setPressure3Val] = useState(0);
  const [thrustVal, setThrustVal] = useState(0);
  const [motorPerc, setMotorPerc] = useState(50);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [packetsReceived, setPacketsReceived] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const totalLatencyRef = useRef(0);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [lastDataTS, setLastDataTS] = useState(0);
  const [data, setData] = useState<Data>({
    pressureTank: 0,
    fuel: 0,
    oxidiser: 0,
    pressure1: 0,
    pressure2: 0,
    pressure3: 0,
    thrust: 0,
    motor1: 0,
    motor2: 0,
    motor3: 0,
  });

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     let v = parseInt(`${motorPerc + (Math.random() - 0.1) * 5}`);
  //     if (v < 0) v = 10;
  //     if (v > 100) v = 90;
  //     setMotorPerc(v);
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    // Configure WebRTC
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    pcRef.current = pc;

    // Create data channel
    const channel = pc.createDataChannel('sensorData', {
      ordered: false,
      maxRetransmits: 0
    });
    channelRef.current = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
      setConnectionStatus('Connected');
    };

    // channel.onmessage = (event) => {
    //   const timestamp = performance.now();
    //   const [temperature, humidity] = event.data.split(',');

    //   // Update statistics
    //   setPacketsReceived(prev => prev + 1);
    //   const latency = timestamp % 100; // Simplified latency calculation
    //   totalLatencyRef.current += latency;
    //   setAvgLatency(totalLatencyRef.current / packetsReceived);
    //   setLastDataTS(timestamp);
    //   console.log(timestamp);
    //   // Here you can update your graph data
    //   // For example:
    //   pressurent.append(new Date().getTime(), parseFloat(temperature));
    //   fuel.append(new Date().getTime(), parseFloat(humidity));
    // };

    channel.onerror = (error) => {
      console.error('Channel Error:', error);
      setConnectionStatus('Error');
    };

    // Connect to signaling server
    const ws = new WebSocket(server);
    wsRef.current = ws;

    ws.onopen = async () => {
      console.log('Connected to signaling server');
      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      // console.log(msg);
      setConnectionStatus(msg.type == "data" ? "Data Incoming" : "Disconnected");
      setData(strToObj(msg.data));
      const timestamp = performance.now();
      setLastDataTS(timestamp);
      const latency = timestamp - msg.timestamp; // todo: update with real timestamp
      console.log(latency);
      totalLatencyRef.current += latency;
      setAvgLatency(totalLatencyRef.current / packetsReceived);
      setPacketsReceived(prev => prev + 1);


      // if (msg.type === 'answer') {
      // await pc.setRemoteDescription(new RTCSessionDescription(msg));
      // } else if (msg.type === 'ice-candidate') {
      // await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      // }
    };

    ws.onerror = (error) => {
      console.log('WebSocket Error:', error);
      setConnectionStatus('Error');
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState);
    };

    // Cleanup function
    return () => {
      channel.close();
      pc.close();
      ws.close();
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const checkDataTimeout = setInterval(() => {
      const now = performance.now();
      const timeSinceLastData = now - lastDataTS;

      if (lastDataTS !== 0 && timeSinceLastData > 5000) {  // 5000ms = 5 seconds
        setConnectionStatus('Waiting');
      }
    }, 1000);  // Check every second

    return () => clearInterval(checkDataTimeout);
  }, [lastDataTS]);

  useEffect(() => {
    console.dir(data);
    pressurent.append(new Date().getTime(), data.pressureTank);
    fuel.append(new Date().getTime(), data.fuel);
    oxidiser.append(new Date().getTime(), data.oxidiser);
    pressure1.append(new Date().getTime(), data.pressure1);
    pressure2.append(new Date().getTime(), data.pressure2);
    pressure3.append(new Date().getTime(), data.pressure3);
    thrust.append(new Date().getTime(), data.thrust);
    motor1.append(new Date().getTime(), data.motor1);
    motor2.append(new Date().getTime(), data.motor2);
    motor3.append(new Date().getTime(), data.motor3);
  }, [data]);

  return (
    <div className='flex flex-col items-center justify-around h-screen'>

      <div className="flex justify-between items-center text-white h-full p-2 px-10 max-h-[10vh] w-full">
        <img src="/public/Triton_Rocketry.png" alt="Tritan Logo Left" className='h-full p-2' />
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold tracking-wider font-sans">GROUND CONTROL STATION</div>
          <div className={`text-sm ${connectionStatus === 'Data Incoming'
            ? 'text-green-500'
            : connectionStatus === 'Waiting'
              ? 'text-yellow-500'
              : 'text-red-500'
            }`}>
            Status: {connectionStatus}
          </div>
          <div className="text-xs">
            Packets: {packetsReceived} | Latency: {avgLatency.toFixed(2)}ms
          </div>
        </div>
        <img src="Kalpana Chawla center logo.png" alt="Kalpana Chawala Center Logo" className='h-full' />
      </div>


      {/* Main Content */}
      <main className=" text-white/80 w-screen overflow-clip p-2 flex flex-col gap-2 px-10">
        <div className="flex gap-2">
          {/* Pressure Graphs */}
          <div className="w-1/2 grid grid-cols-3 grid-rows-2 gap-2">
            <XYGraph
              title="Pressure Tank"
              val={data.pressureTank}
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
              val={data.fuel}
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
              val={data.oxidiser}
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
              val={data.pressure1}
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
              val={data.pressure2}
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
              val={data.pressure3}
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
                val={data.thrust}
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
            {[data.motor1, data.motor2, data.motor3].map(
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

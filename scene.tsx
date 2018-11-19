import * as DCL from 'decentraland-api'
import {Vector3, Quaternion, int} from "babylonjs"

export interface IState {
  birdPos: Vector3,
  birdRot: Vector3,
  characterPosition: Vector3, 
  dogPosition: Vector3, 
  dogRotation: Quaternion,
  dogGoal: Goal,
  dogPreviousGoal: Goal,
  dogAnimationWeight: number,
}

enum Goal
{
  Stand,
  Walk,
  Greet,
  Bye,
}

const walkRatio = 0.3

export default class SampleScene extends DCL.ScriptableScene<any, IState>{
  songs: {src: string, name: string, volume: int, loop: boolean, playing: boolean}[] = 
  [
    {src: "art/HowRU.ogg", name: "greeting", volume : 2, loop:false, playing: true},
    {src: "art/Adios.ogg", name: "adios", volume : 2, loop:false, playing: true},
    {src: "art/Footstep.ogg", name: "walk", volume : 2, loop:true, playing: true},
    {src: "", name: "stand", volume : 0, loop:false, playing: false},
  ];
  barkTrue = false;
  song = this.songs[3];

  state: IState = {
    birdPos: new Vector3(5,0,5),
    birdRot: new Vector3(0,0,0),
    characterPosition: new Vector3(0,0,0),
    dogPosition: new Vector3(0,0,0),
    dogRotation: new Quaternion(0,0,0,0),
    dogGoal: Goal.Stand,
    dogPreviousGoal: Goal.Stand,
    dogAnimationWeight: 1,
  }

  sceneDidMount() {

    this.subscribeTo("positionChanged", (e) =>
    {
      this.setState({characterPosition: new Vector3(e.position.x, e.position.y, e.position.z)});
    }); 

    setInterval(() => {
      let meX=this.state.characterPosition.x;
      let meZ=this.state.characterPosition.z;
      let dogX=this.state.birdPos.x;
      let dogZ=this.state.birdPos.z;
      let distSquare = (meX-dogX)*(meX-dogX)+(meZ-dogZ)*(meZ-dogZ);
      console.log("meX : "+meX);
      console.log("meZ : "+meZ);
      console.log("dogX : "+dogX);
      console.log("dogZ : "+dogZ);
      console.log("distSquare : "+distSquare);


      switch(this.state.dogGoal){
        case Goal.Walk:
          console.log("Goal Walk State!");

            if(distSquare < 10){
              console.log("get!");
              this.setState({dogPreviousGoal:Goal.Walk});
              this.setState({dogGoal:Goal.Greet});
              this.song=this.songs[0];
              break;
            }

          if(Math.random()>1-walkRatio){
            this.setState({dogPreviousGoal:Goal.Walk});
            this.setState({dogGoal:Goal.Stand});
            this.song=this.songs[3];
          }
        break;
        case Goal.Stand:
            //this.song.volume = 0;
            console.log("Goal Walk Stand!");
            if(distSquare < 10){
              console.log("get!");
              this.setState({dogPreviousGoal:Goal.Walk});
              this.setState({dogGoal:Goal.Greet});
              this.song=this.songs[0];
              break;
            }
            if(Math.random()>walkRatio){
              this.setState({dogPreviousGoal:Goal.Stand});
              this.setState({dogGoal:Goal.Walk});
              this.song=this.songs[2];
              this.newBirdPos();
            }
        break;
        case Goal.Greet:

          if(distSquare > 10){
            console.log("get out!");
            this.setState({dogPreviousGoal:Goal.Greet});
            this.setState({dogGoal:Goal.Stand});
            this.song=this.songs[1];
            break;
          }

          console.log("Goal Walk Greet!");
          this.doGreet();
        break;
        case Goal.Bye:
          console.log("Goal Walk Bye!");
          console.log("Goal Walk Bye finised");
          this.setState({dogPreviousGoal:Goal.Bye});
          if(this.state.dogPreviousGoal==Goal.Bye){
            this.setState({dogGoal:Goal.Stand});
          }
        break;
      }
    }, 1000);

  }
  doGreet() {
    console.log("doGreet was called!!!");
    this.barkTrue = true;
    const newRot = new Vector3(this.state.characterPosition.x,0,this.state.characterPosition.z);
    this.setState({birdRot : newRot});
  }

  
  newBirdPos() {
    console.log("newBirdPos was called!!!");
    const newPos = new Vector3(Math.random()*9+0.5, 0, Math.random()*9+0.5);
    this.setState({birdRot : newPos,
      birdPos : newPos,
    });
  }

  getAnimationRates() : {idle: number, sit: number, walk: number} 
  {
    let sit = 0;
    let walk = 0;

    switch(this.state.dogGoal){
      case Goal.Stand:
      sit=0;
      walk=0;
      break;
      case Goal.Walk:
      sit=0;
      walk=1;
      break;
      case Goal.Greet:
      sit=1;
      walk=0;
      break;
      case Goal.Bye:
      sit=0;
      walk=0;
      break;
    }
    return {idle: 1 - (sit + walk), sit, walk};
  }

  async render() {
    const animationWeights = this.getAnimationRates();
    return (
      <scene>
        <gltf-model
        //src="art/BlockDog.gltf"
        src="art/Paladin1k.gltf"
        scale={1}
        position={this.state.birdPos}
        transition={{
          position:{ duration: 1000, timing: "linear" },
        }}
        lookAt={this.state.birdRot}
        skeletalAnimation={[
          { 
            clip: "Idle", 
            weight: animationWeights.idle,
          },
          { 
            clip: "Walking", 
            weight: animationWeights.walk,
          },
          { 
            clip: "Greeting", 
            weight: animationWeights.sit,
          },
        ]}

      >
        <entity
            position={{x:0, y:0, z:0}}
            sound = {{
              src : this.song.src,
              loop : this.song.loop,
              playing : this.song.playing,
              volume : this.song.volume,
            }}
              />
      </gltf-model>
      <gltf-model
        src="art/CubeRoom.gltf"
        scale={1}
        position={new Vector3(5,0,5)}>
      </gltf-model>
      </scene>
    )
  }
}
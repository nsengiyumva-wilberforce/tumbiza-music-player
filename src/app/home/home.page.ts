import { Component, ViewChild } from '@angular/core';
import { IonRange } from '@ionic/angular';
import { Howl } from 'howler';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface Track {
  name: string;
  path: string;
  size: number;
  date: Date;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  playlist: Track[] = [];
  activeTrack: any = null;
  player: any = null;
  isPlaying = false;
  progress = 0;
  @ViewChild('range', { static: false })
  range!: IonRange;
  subds: any[] = []
  private win: any = window;
  term: string = '';
  can_search: boolean = false;
  constructor() {
    this.ListMP3()
  }

  start(track: Track) {
    if (this.player) {
      this.player.stop();
    }
    this.player = new Howl({
      src: [track.path],
      html5: true,
      onplay: () => {
        this.isPlaying = true;
        this.activeTrack = track;
        this.updateProgress()
      },
      onend: () => {
        this.next();
      }
    })
    this.player.play();
  }

  togglePlayer(pause: any) {
    this.isPlaying = !pause;
    if (pause) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  next() {
    let index = this.playlist.indexOf(this.activeTrack);
    if (index != this.playlist.length - 1) {
      this.start(this.playlist[index + 1]);
    } else {
      this.start(this.playlist[0])
    }
  }

  prev() {
    let index = this.playlist.indexOf(this.activeTrack);
    if (index > 0) {
      this.start(this.playlist[index - 1]);
    } else {
      this.start(this.playlist[length - 1])
    }
  }

  seek() {
    let newValue = +this.range.value
    let duration = this.player.duration()
    this.player.seek(duration * (newValue / 100))
  }

  updateProgress() {
    let seek = this.player.seek();
    this.progress = (seek / this.player.duration()) * 100 || 0;
    setTimeout(() => {
      this.updateProgress();
    }, 1000)
  }

  async ListMP3(){
    console.log("directory", Directory.ExternalStorage)
    const files = await Filesystem.readdir({
      path: '',
      directory: Directory.ExternalStorage
    });
    files.files.forEach(async (file) => {
      if(file.type === 'file'){
        console.log(file)
        //check if file is mp3
        if(file.name.includes('.mp3')){
          //convert file path to contain filesrc
          let path = this.win.Ionic.WebView.convertFileSrc(file.uri);
          let size = (file.size) / 1000000
          let date_of_creation = new Date(file.mtime)
          //push to playlist
          this.playlist.push({
            name: file.name,
            path: path,
            size: size,
            date: date_of_creation
          })
        }
      } else {
        this.checkdirectory(file)
      }
    })
  }

  async checkdirectory(file: any){
    //decode uri to get the actual path
    let dir = decodeURI(file.uri.substring(27))

    const files = await Filesystem.readdir({
      path: dir,
      directory: Directory.ExternalStorage
    });
    files.files.forEach(async (file) => {
      if(file.type === 'directory'){
        this.checkdirectory(file)
      } else {
        if(file.name.includes('.mp3')){
          let path = this.win.Ionic.WebView.convertFileSrc(file.uri);
          let size = (file.size) / 1000000
          let date_of_creation = new Date(file.mtime)
          this.playlist.push({
            name: file.name,
            path: path,
            size: size,
            date: date_of_creation
          })
        }
      }
    })
  }

  showSearch(){
    this.can_search = true;
  }

  dismiss(event: any){
    this.can_search = false;
    console.log(event)
  }
}

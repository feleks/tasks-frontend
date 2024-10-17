export const a = 3;

// import { SongDetailed } from '../../../../../api/entities';
// import React, { createRef } from 'react';
// import { SongExplorerModal, SongExplorerModalSettings } from './Modal';
// import { Set } from 'immutable';
// import { SegmentLoading } from '../../../../../components/segment-loading/SegmentLoading';
// import { secondsToStr } from './utils';
//
// type Loadings = 'createPoint' | 'createLoop';
// interface Props {
//     song: SongDetailed;
//     songModal: boolean;
//
//     setError(err: string): void;
//     closeSongModal(): void;
// }
//
// interface State {
//     loadings: Set<Loadings>;
//     modal: SongExplorerModalSettings | null;
//     selectedSpeed: number;
//     loopStart: number | null;
//     selectedLoopID: number | null;
// }
//
// export class SongExplorer2 extends React.Component<Props, State> {
//     private speedOptions = [80, 85, 90, 95, 100];
//
//     private initialized = false;
//     private audio: HTMLAudioElement = null as any;
//     private song: SongDetailed;
//
//     private explorerRefs = {
//         player: createRef<HTMLDivElement>(),
//         playerBorder: createRef<HTMLDivElement>(),
//         audio: createRef<HTMLAudioElement>(),
//         audioSource: createRef<HTMLSourceElement>(),
//         currentFill: createRef<HTMLDivElement>(),
//         currentTime: createRef<HTMLDivElement>(),
//         pointerFill: createRef<HTMLDivElement>(),
//         pointerTime: createRef<HTMLDivElement>()
//     };
//     private elems: { [T in keyof typeof this.explorerRefs]: NonNullable<typeof this.explorerRefs[T]['current']> } = null as any;
//     constructor(props: Props) {
//         super(props);
//
//         this.setState({
//             loadings: Set(),
//             modal: null,
//             selectedSpeed: 100,
//             loopStart: null,
//             selectedLoopID: null
//         });
//
//         this.song = props.song;
//     }
//
//     componentDidMount = () => {
//         (async () => {
//             try {
//                 this.initializeElems();
//                 await this.initializePlayer();
//                 if (this.elems.audio.duration == null || this.elems.audio.duration === 0) {
//                     return this.props.setError('Не удалось инициализировать плеер: песня имеет длину 0');
//                 }
//                 this.initialized = true;
//             } catch (e) {
//                 console.error(e);
//                 this.props.setError('Не удалось инициализировать плеер');
//             }
//         })();
//     };
//
//     render = () => {
//         // let loopViewSegment: [number, number] | null = null;
//         // if (this.initialized) {
//         //     if (this.loopStart != null) {
//         //         loopViewSegment = [this.loopStart, this.audio.currentTime];
//         //     } else if (this.selectedLoop != null && this.selectedLoop.loop != null) {
//         //         loopViewSegment = [selectedLoop.loop[0], selectedLoop.loop[1]];
//         //     } else if (loopInActionSegment != null) {
//         //         loopViewSegment = [loopInActionSegment[0], loopInActionSegment[1]];
//         //     }
//         // }
//
//         return (
//             <div className="song-explorer">
//                 {!this.initialized ? (
//                     <SegmentLoading />
//                 ) : (
//                     <>
//                         {this.state.modal != null ? (
//                             <SongExplorerModal
//                                 {...this.state.modal}
//                                 close={() => {
//                                     if (this.state.modal?.type === 'update_song') {
//                                         this.props.closeSongModal();
//                                     }
//                                     this.setState({ modal: null });
//                                 }}
//                                 deleteAction={(actionID) => {
//                                     this.song.actions = [...this.song.actions].filter((action) => {
//                                         return action.id != actionID;
//                                     });
//                                     if (this.state.selectedLoopID == actionID) {
//                                         this.setState({ modal: null });
//                                     }
//                                 }}
//                             />
//                         ) : null}
//                         <div className="song-explorer-fixed">
//                             <div ref={this.explorerRefs.player} className="song-explorer-player">
//                                 <audio ref={this.explorerRefs.audio} controls>
//                                     <source ref={this.explorerRefs.audioSource} />
//                                 </audio>
//                                 <div className="song-explorer-player-duration start">00:00</div>
//                                 <div className="song-explorer-player-duration end">{secondsToStr(this.audio.duration)}</div>
//
//                                 <div className="song-explorer-player-container">
//                                     <div ref={this.explorerRefs.playerBorder} className="song-explorer-player-border"></div>
//                                     <div ref={this.explorerRefs.currentFill} className="song-explorer-player-current-fill"></div>
//                                     {this.song.actions.map((action) => {
//                                         if (action.type != 'point' || action.point == null) {
//                                             return;
//                                         }
//
//                                         const leftStr = `${((action.point / this.audio.duration) * 100).toFixed(2)}%`;
//
//                                         return (
//                                             <div
//                                                 key={action.id}
//                                                 style={{ left: leftStr }}
//                                                 className="song-explorer-player-point"
//                                             ></div>
//                                         );
//                                     })}
//                                     {loopFill}
//                                     <div ref={this.explorerRefs.currentTime} className="song-explorer-player-current-time"></div>
//                                     <div ref={this.explorerRefs.pointerFill} className="song-explorer-player-pointer-fill"></div>
//                                     <div ref={this.explorerRefs.pointerTime} className="song-explorer-player-pointer-time"></div>
//                                 </div>
//                             </div>
//                             <div className="song-explorer-controls">
//                                 {this.audio.paused ? (
//                                     <Button
//                                         className="song-explorer-player-controls-play resume"
//                                         value={<FontAwesomeIcon icon={faPlay} />}
//                                         onClick={async () => {
//                                             try {
//                                                 await this.audio.play();
//                                             } catch (e) {
//                                                 this.props.setError('Ошибка запуска аудио');
//                                             }
//                                         }}
//                                         style="grey"
//                                     />
//                                 ) : (
//                                     <Button
//                                         className="song-explorer-player-controls-play pause"
//                                         value={<FontAwesomeIcon icon={faPause} />}
//                                         style="grey"
//                                         onClick={() => {
//                                             this.audio.pause();
//                                         }}
//                                     />
//                                 )}
//                                 {/* {loopInActionSegment != null ? (*/}
//                                 {/*    <div className="song-explorer-player-controls-loop">*/}
//                                 {/*        <div className="loop-segment">*/}
//                                 {/*            <span className="loop-segment-val">{secondsToStr(loopInActionSegment[0])}</span>*/}
//                                 {/*            <span className="loop-segment-sep">-</span>*/}
//                                 {/*            <span className="loop-segment-val">{secondsToStr(loopInActionSegment[1])}</span>*/}
//                                 {/*        </div>*/}
//                                 {/*        <div*/}
//                                 {/*            className="stop-loop"*/}
//                                 {/*            onClick={() => {*/}
//                                 {/*                setSelectedLoopID(null);*/}
//                                 {/*                setTemporaryLoop(null);*/}
//                                 {/*            }}*/}
//                                 {/*        >*/}
//                                 {/*            <FontAwesomeIcon icon={faTimes} />*/}
//                                 {/*        </div>*/}
//                                 {/*    </div>*/}
//                                 {/* ) : null}*/}
//                             </div>
//                             <div className="song-explorer-speed">
//                                 {this.speedOptions.map((speed) => {
//                                     const selected = speed === this.selectedSpeed;
//                                     return (
//                                         <div
//                                             key={speed}
//                                             className={classNames('song-explorer-speed-item component-button small', {
//                                                 'style-grey': !selected,
//                                                 'style-blue': selected
//                                             })}
//                                             onClick={() => {
//                                                 if (speed != this.selectedSpeed) {
//                                                     this.selectedSpeed = speed;
//                                                     this.update();
//                                                 }
//                                                 this.audio.playbackRate = speed / 100;
//                                             }}
//                                         >
//                                             {speed}%
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                             <div className="song-explorer-actions">
//                                 <Button
//                                     className="song-explorer-actions-point"
//                                     loading={this.isLoading('createPoint')}
//                                     value={
//                                         <span>
//                                             <FontAwesomeIcon icon={faLocationDot} />
//                                             Добавить точку
//                                         </span>
//                                     }
//                                     onClick={this.createPoint}
//                                     style="green"
//                                     small
//                                 />
//                                 {this.loopStart == null ? (
//                                     <Button
//                                         className="song-explorer-actions-loop"
//                                         loading={this.isLoading('createLoop')}
//                                         value={
//                                             <span>
//                                                 <FontAwesomeIcon icon={faRecycle} />
//                                                 Начать цикл
//                                             </span>
//                                         }
//                                         onClick={() => {
//                                             this.loopStart = this.audio.currentTime;
//                                         }}
//                                         style="yellow"
//                                         small
//                                     />
//                                 ) : (
//                                     <Button
//                                         className="song-explorer-actions-loop"
//                                         loading={this.isLoading('createLoop')}
//                                         value={
//                                             <>
//                                                 <span>
//                                                     <FontAwesomeIcon icon={faStop} /> 111
//                                                 </span>
//                                                 {/* <div className="song-explorer-actions-loop-time">01:05</div>*/}
//                                             </>
//                                         }
//                                         onClick={this.createLoop}
//                                         style="yellow"
//                                         small
//                                     />
//                                 )}
//                             </div>
//                         </div>
//                         <div className="song-explorer-scroll">
//                             <div className="song-explorer-actions-history">
//                                 <div className="song-explorer-actions-history-title">Сохраненные действия</div>
//                                 <div className="song-explorer-actions-history-container">
//                                     {song.actions.map(actionTransformer)}
//                                 </div>
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         );
//     };
//
//     private isLoading(key: Loadings): boolean {
//         return this.loadings.has(key);
//     }
//
//     private setLoading(key: Loadings, isLoading: boolean) {
//         if (isLoading) {
//             this.loadings.add(key);
//         } else {
//             this.loadings.delete(key);
//         }
//     }
//     private initializeElems = () => {
//         const keys: (keyof typeof this.explorerRefs)[] = Object.keys(this.explorerRefs) as any;
//         const elems = {} as any;
//
//         for (const key of keys) {
//             const ref = this.explorerRefs[key];
//
//             if (ref.current == null) {
//                 throw Error(`ref ${key} doesnt exist on initializeElems`);
//             }
//
//             elems[key] = ref.current;
//         }
//
//         this.elems = elems;
//         this.audio = this.elems.audio;
//     };
//     private initializePlayer = async () => {
//         const res = await fetch(`/frontend/download_song/${this.props.song.id}`);
//         const blob = await res.blob();
//         const blobOU = window.URL.createObjectURL(blob);
//
//         const audioElem = this.elems.audio;
//         const audioSourceElem = this.elems.audioSource;
//         const contentType = res.headers.get('Content-Type');
//         if (contentType == null) {
//             throw new Error('contentType is null');
//         }
//
//         audioSourceElem.setAttribute('src', blobOU);
//         audioSourceElem.setAttribute('type', contentType);
//
//         audioElem.load();
//         audioElem.volume = 0.4;
//
//         await this.waitForAudio(audioElem);
//     };
//
//     private waitForAudio = async (audio: HTMLAudioElement): Promise<void> => {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 reject(new Error('wait for audio timeout!'));
//             }, 3000);
//
//             const cb = () => {
//                 audio.removeEventListener('canplaythrough', cb);
//                 resolve();
//             };
//             audio.addEventListener('canplaythrough', cb);
//         });
//     };
//
//     private createPoint = async () => {
//         if (this.isLoading('createPoint')) {
//             return;
//         }
//
//         try {
//             this.setLoading('createPoint', true);
//
//             const action = await apiCall('/frontend/create_action', {
//                 song_id: this.song.id,
//                 type: 'point',
//                 point: this.audio.currentTime
//             });
//             this.song.actions = [action, ...this.song.actions];
//         } finally {
//             this.setLoading('createPoint', false);
//         }
//     };
//
//     private createLoop = async () => {
//         if (this.loopStart == null || this.isLoading('createLoop')) {
//             return;
//         }
//
//         try {
//             this.setLoading('createLoop', true);
//
//             const segment = this.normalizeLoop([this.loopStart, this.audio.currentTime]);
//             this.loopStart = null;
//
//             const action = await apiCall('/frontend/create_action', {
//                 song_id: this.song.id,
//                 type: 'loop',
//                 loop: segment
//             });
//             this.song.actions = [action, ...this.song.actions];
//         } finally {
//             this.setLoading('createLoop', false);
//         }
//     };
//
//     private normalizeLoop = (loop: [number, number]): [number, number] => {
//         if (loop[0] < loop[1]) {
//             return loop;
//         } else {
//             return [loop[1], loop[0]];
//         }
//     };
//
//     private actionTransformer = (action: SongAction) => {
//         const isLoop = action.type === 'loop';
//         const isPoint = action.type === 'point';
//
//         let icon = null;
//         let duration = null;
//         if (isLoop && action.loop != null) {
//             icon = <FontAwesomeIcon icon={faRecycle} className="loop" />;
//             duration = (
//                 <span className="item-duration loop">
//                     {secondsToStr(action.loop[0])} - {secondsToStr(action.loop[1])}
//                 </span>
//             );
//         } else if (isPoint && action.point != null) {
//             icon = <FontAwesomeIcon icon={faLocationDot} className="point" />;
//             duration = <span className="item-duration point">{secondsToStr(action.point)}</span>;
//         }
//
//         const selected = this.loopStart == action.id;
//
//         return (
//             <div
//                 key={action.id}
//                 className={classNames(
//                     'component-button small',
//                     'style-grey',
//                     {
//                         selected
//                     },
//                     'song-explorer-actions-history-item'
//                 )}
//                 onClick={() => {
//                     if (isLoop) {
//                         this.loopStart = null;
//                         if (!selected) {
//                             this.selectedLoopID = action.id;
//                         } else {
//                             this.selectedLoopID = null;
//                         }
//                     } else if (isPoint && action.point != null) {
//                         this.audio.currentTime = action.point;
//                     }
//                 }}
//             >
//                 {icon}
//                 {duration}
//                 {action.name != null ? (
//                     <span className="item-name">{action.name}</span>
//                 ) : (
//                     <span className="item-date">{moment(action.created_at).format('DD.MM.YYYY HH:mm:ss')}</span>
//                 )}
//                 <div className="item-controls">
//                     <div
//                         className={classNames('item-rename')}
//                         onClick={(e) => {
//                             e.stopPropagation();
//
//                             setModal({ type: 'rename_action', action, song });
//                         }}
//                     >
//                         <FontAwesomeIcon icon={faPencil} />
//                     </div>
//                     <div
//                         className={classNames('item-delete')}
//                         onClick={(e) => {
//                             e.stopPropagation();
//
//                             setModal({ type: 'delete_action', action, song });
//                         }}
//                     >
//                         <FontAwesomeIcon icon={faTrashCan} />
//                     </div>
//                 </div>
//             </div>
//         );
//     };
// }

export const stickerKinds = {
  arrow: {label:"오른쪽 화살표",group:"화살표",shape:'<path d="M14 48H70V25L108 60 70 95V72H14Z"/>'},
  doubleArrow: {label:"양방향 화살표",group:"화살표",shape:'<path d="M8 60 37 30V48H83V30L112 60 83 90V72H37V90Z"/>'},
  turnArrow: {label:"꺾인 화살표",group:"화살표",shape:'<path d="M18 105V58Q18 28 48 28H72V10L108 40 72 70V52H50Q42 52 42 62V105Z"/>'},
  circle: {label:"원",group:"도형",shape:'<circle cx="60" cy="60" r="44" fill="none" stroke-width="5"/>'},
  square: {label:"사각형",group:"도형",shape:'<rect x="17" y="17" width="86" height="86" rx="8" fill="none" stroke-width="5"/>'},
  triangle: {label:"삼각형",group:"도형",shape:'<path d="M60 12 109 104H11Z" fill="none" stroke-width="5" stroke-linejoin="round"/>'},
  diamond: {label:"마름모",group:"도형",shape:'<path d="m60 9 47 51-47 51L13 60Z" fill="none" stroke-width="5" stroke-linejoin="round"/>'},
  star: {label:"별",group:"기호",shape:'<path d="m60 8 15 33 36 4-27 25 8 36-32-18-32 18 8-36L9 45l36-4Z" stroke-width="3" stroke-linejoin="round"/>'},
  heart: {label:"하트",group:"기호",shape:'<path d="M60 103 19 64C-7 36 26 5 49 29l11 12 11-12C94 5 127 36 101 64Z"/>'},
  check: {label:"체크",group:"기호",shape:'<path d="m19 61 27 28 57-65" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'},
  plus: {label:"더하기",group:"기호",shape:'<path d="M60 20V100M20 60H100" fill="none" stroke-width="12" stroke-linecap="round"/>'},
  pin: {label:"위치 표시",group:"기호",shape:'<path d="M60 111S24 74 24 45a36 36 0 1 1 72 0c0 29-36 66-36 66Z"/><circle cx="60" cy="44" r="12" fill="#fffefd" stroke="none"/>'},
  house: {label:"집",group:"도시 모형",shape:'<path d="M12 55 60 14l48 41M26 48v58h68V48" fill="none" stroke-width="6" stroke-linejoin="round"/><path d="M49 106V72h22v34" fill="none" stroke-width="5"/>'},
  building: {label:"건물",group:"도시 모형",shape:'<path d="M22 107V15h53v92M75 49h24v58M9 107h102M37 32h23M37 50h23M37 68h23M45 107V88h15v19" fill="none" stroke-width="5" stroke-linejoin="round"/>'},
  tree: {label:"나무",group:"도시 모형",shape:'<path d="M60 13 30 51h14L20 81h80L76 51h14Z" stroke-width="4" stroke-linejoin="round"/><path d="M60 80v28" fill="none" stroke-width="8"/>'},
  person: {label:"사람",group:"도시 모형",shape:'<circle cx="60" cy="23" r="14"/><path d="M60 47v31M28 56h64M60 78l-24 31M60 78l24 31" fill="none" stroke-width="9" stroke-linecap="round"/>'},
} as const;
export const stickerColors = {ink:"#293f49",green:"#527d69",blue:"#527ba0",pink:"#ad687f",purple:"#8270a3"} as const;
export type BoardSticker={id:string;kind:keyof typeof stickerKinds;color:keyof typeof stickerColors;rotation:0|90|180|270};
export function stickerSVG(sticker:Pick<BoardSticker,"kind"|"color"|"rotation">){
  return `<g transform="rotate(${sticker.rotation} 60 60)" fill="${stickerColors[sticker.color]}" stroke="${stickerColors[sticker.color]}">${stickerKinds[sticker.kind].shape}</g>`;
}

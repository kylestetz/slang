import acousticHatOpen1 from '../static/audio/acoustic/hihat_open1.mp3';
import acousticHatOpen2 from '../static/audio/acoustic/hihat_open2.mp3';
import acousticHatOpen3 from '../static/audio/acoustic/hihat_open3.mp3';
import acousticHat1 from '../static/audio/acoustic/hihat1.mp3';
import acousticHat2 from '../static/audio/acoustic/hihat2.mp3';
import acousticKick1 from '../static/audio/acoustic/kick1.mp3';
import acousticKick2 from '../static/audio/acoustic/kick2.mp3';
import acousticKick3 from '../static/audio/acoustic/kick3.mp3';
import acousticRim1 from '../static/audio/acoustic/rim1.mp3';
import acousticSnare1 from '../static/audio/acoustic/snare1.mp3';
import acousticSnare2 from '../static/audio/acoustic/snare2.mp3';
import acousticSnare3 from '../static/audio/acoustic/snare3.mp3';

const drumMap = {
	0: {
		file: acousticKick1,
		label: 'acoustic kick 1'
	},
	1: {
		file: acousticKick2,
		label: 'acoustic kick 2'
	},
	2: {
		file: acousticKick3,
		label: 'acoustic kick 3'
	},
	3: {
		file: acousticSnare1,
		label: 'acoustic snare 1'
	},
	4: {
		file: acousticSnare2,
		label: 'acoustic snare 2'
	},
	5: {
		file: acousticSnare3,
		label: 'acoustic snare 3'
	},
	6: {
		file: acousticHat1,
		label: 'acoustic hat 1'
	},
	7: {
		file: acousticHat2,
		label: 'acoustic hat 2'
	},
	8: {
		file: acousticHatOpen1,
		label: 'acoustic hat (open) 1'
	},
	9: {
		file: acousticHatOpen2,
		label: 'acoustic hat (open) 2'
	},
	10: {
		file: acousticHatOpen3,
		label: 'acoustic hat (open) 3'
	},
	11: {
		file: acousticRim1,
		label: 'acoustic rim'
	},
};

export default drumMap;

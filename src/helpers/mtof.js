export default function mtof(note) {
	return (2 ** ((note - 69) / 12)) * 440.0;
}

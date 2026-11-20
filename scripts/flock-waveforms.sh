set -eu

for sample in public/apps/flock-samples/*.mp3; do
  ffmpeg -v error -y -i "$sample" \
    -filter_complex 'aformat=channel_layouts=mono,showwavespic=s=640x176:colors=0x808080:scale=sqrt:draw=full:filter=peak' \
    -frames:v 1 -update 1 "${sample%.mp3}.png"
done

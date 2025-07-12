import sys
import whisper
import os

def main():
    if len(sys.argv) < 2:
        print('Usage: python generate_subtitles.py <media_file>', file=sys.stderr)
        sys.exit(1)
    media_file = sys.argv[1]
    if not os.path.exists(media_file):
        print(f'File not found: {media_file}', file=sys.stderr)
        sys.exit(1)
    model = whisper.load_model('base')
    result = model.transcribe(media_file, task='transcribe', verbose=False)
    print(result['srt'])

if __name__ == '__main__':
    main() 
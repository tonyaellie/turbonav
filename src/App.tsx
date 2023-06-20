import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect } from 'react';

const App = () => {
  const [dir, setDir] = useState(['~']);
  const [files, setFiles] = useState<
    {
      file_name: string;
      file_type: string;
    }[]
  >([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number>(0);

  const getFiles = async () => {
    const files = await invoke<
      {
        file_name: string;
        file_type: 'dir' | 'file' | 'symlink' | 'unknown';
      }[]
    >('get_files', { dir });
    setFiles(files);
  };

  useEffect(() => {
    console.log('dir', dir);
    getFiles();
  }, [dir]);

  return (
    <div
      tabIndex={0}
      onKeyUp={(e) => {
        console.log(e.key);
        // if only key is a letter (and not a modifier)
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          setSearch(search + e.key);
        }
        if (e.key === 'Backspace') {
          if (search === '' && dir.length > 1) {
            setDir(dir.slice(0, dir.length - 1));
          }
          setSearch('');
        }
        if (e.key === 'ArrowUp') {
          setSelected(selected <= 0 ? 0 : selected - 1);
        }
        if (e.key === 'ArrowDown') {
          setSelected(
            selected >= files.length - 1 ? files.length - 1 : selected + 1
          );
        }
        if (e.key === 'Enter') {
          if (files[selected].file_type === 'dir') {
            setDir([
              ...dir,
              files.filter(
                (f) =>
                  (f.file_name.toLowerCase().startsWith(search.toLowerCase()) &&
                    search !== '') ||
                  (search === '' && f.file_name[0] !== '.')
              )[selected].file_name,
            ]);
            setSelected(0);
            setSearch('');
          }
        }
      }}
    >
      <div className="flex justify-center gap-1">
        {dir
          .map((d, i) => (
            <div
              key={d}
              className="cursor-pointer select-none text-blue-500"
              onClick={() => {
                setDir(dir.slice(0, i + 1));
                setSelected(0);
                setSearch('');
              }}
            >
              {d}
            </div>
          ))
          .reduce(
            (prev, curr) =>
              [prev, <div className="select-none">/</div>, curr] as any
          )}
      </div>
      <div className="flex justify-center">
        {search !== '' && (
          <div
            className="cursor-pointer select-none text-green-500"
            onClick={() => setSearch('')}
          >
            {search}
          </div>
        )}
      </div>
      <div className="flex h-max flex-col items-center justify-center gap-1">
        {files
          .filter(
            (f) =>
              (f.file_name.toLowerCase().startsWith(search.toLowerCase()) &&
                search !== '') ||
              (search === '' && f.file_name[0] !== '.')
          )
          .map((file, i) => (
            <div
              key={file.file_name}
              className={
                (file.file_type === 'dir'
                  ? 'cursor-pointer text-blue-500'
                  : 'text-gray-500') + (i === selected ? ' underline' : '')
              }
              onClick={() => {
                if (file.file_type === 'dir') {
                  setDir([...dir, file.file_name]);
                  setSelected(0);
                }
              }}
            >
              {file.file_type === 'dir' ? '📁' : '📄'}{' '}
              {file.file_type === 'dir' ? `${file.file_name}/` : file.file_name}
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;

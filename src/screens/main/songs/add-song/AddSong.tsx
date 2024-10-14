import React, { useState } from 'react';
import './AddSong.scss';
import { Input } from '../../../../components/input/Input';
import { Button } from '../../../../components/button/Button';
import { InputFile } from '../../../../components/input-file/InputFile';
import { useNotificationStore } from '../../../../stores/notification';
import { apiCall } from '../../../../api/api_call';
import { SongBrief, SongFormat } from '../../../../api/entities';
import { listSongs } from '../../../../stores/songs';
import { useNavigate } from 'react-router-dom';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                throw new Error(`toBase64 returned non string: ${typeof result}`);
            }
            resolve(result);
        };
        reader.onerror = reject;
    });
}

export function AddSong() {
    const navigate = useNavigate();
    const showNotification = useNotificationStore((state) => state.show);

    const [name, setName] = useState<string>('');
    const [performer, setPerformer] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    async function createSong() {
        const innerFunc = async () => {
            if (name.length === 0) {
                return showNotification('error', 'Имя песни не может быть пустым');
            } else if (file == null) {
                return showNotification('error', 'Выберите аудиофайл песни');
            }

            let format: SongFormat;
            if (file.type === 'audio/mpeg') {
                format = 'mp3';
            } else if (file.type === 'audio/flac') {
                format = 'flac';
            } else {
                return showNotification(
                    'error',
                    `Некорректный формат аудиофайла '${file.type}': разрешены только mp3 и flac файлы`
                );
            }

            let song: SongBrief;
            try {
                song = await apiCall(
                    '/frontend/create_song',
                    {
                        name: name,
                        performer: performer.length > 0 ? performer : undefined,
                        format
                    },
                    { files: [file] }
                );
            } catch (e) {
                console.error(e);
                return;
                // if (e instanceof ApiError) {
                //     return showNotification('error', e.text ?? 'Не удалось создать песню');
                // } else {
                //     return showNotification('error', 'Не удалось создать песню');
                // }
            }

            showNotification('success', `Песня ${song.name} успешно загружена`);

            navigate('/songs');

            listSongs(true);
        };

        if (loading) {
            return;
        }

        setLoading(true);
        try {
            await innerFunc();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="screen-add-song segment">
            <div className="screen-add-song-top-panel">
                <span
                    onClick={() => {
                        navigate('/songs');
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} /> Добавление песни
                </span>
            </div>
            <form
                className="screen-add-song-form"
                onSubmit={(e) => {
                    e.preventDefault();

                    createSong();
                }}
            >
                <Input
                    label="Название"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <Input
                    label="Исполнитель"
                    value={performer}
                    onChange={(e) => {
                        setPerformer(e.target.value);
                    }}
                />
                <InputFile
                    id="input-file-song"
                    buttonText="Выбрать аудиофайл"
                    file={file}
                    onChange={(file) => {
                        setFile(file);
                        if (file != null) {
                            (async () => {
                                console.log(await toBase64(file));
                            })();
                        }
                    }}
                />
                <Button submit value="Создать" loading={loading} />
            </form>
        </div>
    );
}

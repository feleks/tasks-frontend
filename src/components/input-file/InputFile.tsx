import React from 'react';
import './InputFile.scss';

interface Props {
    id: string;
    buttonText: string;
    file: File | null;
    onChange(file: File | null): void;
}

export function InputFile(props: Props) {
    const file = props.file;

    return (
        <div className="component-input-file">
            <label htmlFor={props.id} className="component-button style-grey component-input-file-label ">
                {props.buttonText}
            </label>

            {file == null ? null : <div className="component-input-file-selected-file">{file.name}</div>}

            <input
                className="component-input-file-input"
                id={props.id}
                type="file"
                onChange={(e) => {
                    const fileList = e?.target?.files;
                    if (fileList == null) {
                        return props.onChange(null);
                    }

                    const file = fileList.item(0);
                    if (file == null) {
                        return props.onChange(null);
                    }

                    props.onChange(file);
                }}
            />
        </div>
    );
}

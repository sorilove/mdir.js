import { Reader } from "../common/Reader";
import { File } from "../common/File";

export enum ClipBoard {
    CLIP_NONE,
    CLIP_COPY,
    CLIP_CUT
}

let gSelection: Selection = null;

export class Selection {
    private arrFiles: File[] = [];
    private isExpandDir = true;
    private stateClipboard: ClipBoard = ClipBoard.CLIP_NONE;

    getClipboard() {
        return this.stateClipboard;
    }

    set( files: File[], stateClipboard: ClipBoard ) {
        this.arrFiles = files;
        this.stateClipboard = stateClipboard;
    }

    clear() {
        this.arrFiles = [];
        this.isExpandDir = true;
    }

    push( file: File ) {
        this.arrFiles.push( file );
    }

    get length() {
        return this.arrFiles;
    }

    getFiles() {
        return this.arrFiles;
    }

    get( number ) {
        return this.arrFiles[number];
    }

    get size() {
        return this.arrFiles.reduce( (size, file) => size + file.size, 0);
    }

    getExpandSize() {
        return this.size;
    }

    async expandDir(reader: Reader) {
        if ( !this.isExpandDir || !reader ) {
            return;
        }

        interface IDir {
            dirFile: File;
            checked: boolean;
        }

        let arrDirs: IDir[] = [];
        this.arrFiles.forEach( (item) => item.dir && !item.link && arrDirs.push( { dirFile: item, checked: false } ) );

        const beforeDir = reader.currentDir();
        for ( ;; ) {
            let dir = arrDirs.find( (item) => !item.checked );
            if ( !dir ) break;

            dir.checked = true;

            const files = await reader.readdir( dir.dirFile );
            files && files.forEach( (item) => {
                if ( item.fullname !== dir.dirFile.fullname && item.dir && !item.link ) {
                    arrDirs.push( { dirFile: item, checked: false } );
                }
            });
        }

        reader.readdir(beforeDir);
        this.isExpandDir = true;
    }

    static instance() {
        if ( !gSelection ){
            gSelection = new Selection();
        }
        return gSelection;
    }
}

export default function selection(): Selection {
    return Selection.instance();
}

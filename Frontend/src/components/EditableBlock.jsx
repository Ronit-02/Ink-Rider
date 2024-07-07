import { useCallback, useEffect, useRef, useState } from "react";
import ContentEditable from "react-contenteditable";
import PropTypes from "prop-types";

const EditableBlock = ({id, html: initialHtml, tag: initialTag, addBlock, deleteBlock, updatePage}) => {
  
    const [html, setHtml] = useState(initialHtml);
    const [tag, setTag] = useState(initialTag);
    const [htmlBackup, setHtmlBackup] = useState(null); 
    const [previousKey, setPreviousKey] = useState('');
    const contentEditable = useRef(null);

    useEffect(() => {
        console.log('Previous Key - ', previousKey);
        console.log('Html changed - ', html);
        console.log('HTML Backup changed - ', htmlBackup);
    }, [previousKey, html, htmlBackup])

    useEffect(() => {
        updatePage({
            id,
            tag,
            html,
        });
    }, [html, tag, id]);


    const handleChange = (e) => {
        setHtml(e.target.value);
    }

    // Handling key operations
    const keyDownHandler = (e) => {

        if(e.key === '/')
            setHtmlBackup(html);
        if(e.key === 'Enter'){
            if(previousKey !== 'Shift'){
                console.log('Added new block')
                e.preventDefault();
                addBlock({
                    id: id,
                    ref: contentEditable.current,
                });
            }
        }
        if(e.key === 'Delete')
            deleteBlock({
                id: id,
                ref: contentEditable.current
            })

        // if(e.key === 'Backspace' && !html){
        //     e.preventDefault();
        //     deleteBlock({
        //         id: id,
        //         ref: contentEditable.current
        //     })
        // }

      setPreviousKey(e.key);
    }

    return (
    <div>
        <ContentEditable 
            className="mt-1 bg-blue-100"
            innerRef={contentEditable}
            html={html}
            tagName={tag}
            onChange={handleChange}
            onKeyDown={keyDownHandler}
        />    
    </div>
  )
}

EditableBlock.propTypes = ({
    id: PropTypes.string, 
    html: PropTypes.string,
    tag: PropTypes.string,
    addBlock: PropTypes.any,
    deleteBlock: PropTypes.any,
    updatePage: PropTypes.any 
})

export default EditableBlock;
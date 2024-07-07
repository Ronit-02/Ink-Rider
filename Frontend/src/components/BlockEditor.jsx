import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import EditableBlock from "./EditableBlock";

const BlockEditor = () => {
  
    // block element
    const initialBlock = { id: uuid(), html: "", tag: "p" };
    const [blocks, setBlocks] = useState([initialBlock]);
    const newBlockRef = useRef(null);
    const [newBlockId, setNewBlockId] = useState(null);

    // updates blocks on change
    const updatePageHandler = (updatedBlock) => {
        setBlocks((prevBlocks) => {
        return prevBlocks.map((block) =>
            block.id === updatedBlock.id
            ? { ...block, tag: updatedBlock.tag, html: updatedBlock.html }
            : block
        );
        });
    };

    // adds block next to current block
    const addBlockHandler = (currentBlock) => {
        const newBlock = { id: uuid(), html: "new-block", tag: "p" };

        setBlocks((prevBlocks) => {
            // find index
            const index = prevBlocks.findIndex(
                (block) => block.id === currentBlock.id
            );

            // create updated blocks
            const updatedBlocks = [...prevBlocks];

            // add new-block next to current index
            updatedBlocks.splice(index + 1, 0, newBlock);
            newBlockRef.current = newBlock.id;

            setNewBlockId(newBlock.id);

            return updatedBlocks;
        });
    };

    // deletes a particular block
    const deleteBlockHandler = (currentBlock) => {

        setBlocks((prevBlocks) => {

            // find index
            const index = prevBlocks.findIndex(
                (block) => block.id === currentBlock.id
            );

            // if block not found
            if (index === -1) return prevBlocks;

            // delete block
            const updatedBlocks = [...prevBlocks];
            updatedBlocks.splice(index, 1);

            // focus on the prev block
            const prevBlock = currentBlock.ref.previousElementSibling;
            if (prevBlock) {
                prevBlock.focus();
            }

            return updatedBlocks;
        });
    };

    useEffect(() => {
        if(newBlockId) {
            const newBlock = blocks.find((block) => block.id ===  newBlockId)
            console.log('NewBlock - ', newBlock);
        }
        console.log('Blocks - ', blocks);
    }, [blocks, newBlockId]);

  return (
    <div>
        <h1 className="text-2xl">This is the block editor</h1>
        {blocks.map((block) => (
            <EditableBlock
                key={block.id}
                id={block.id}
                tag={block.tag}
                html={block.html}
                updatePage={updatePageHandler}
                addBlock={addBlockHandler}
                deleteBlock={deleteBlockHandler}
            />
        ))}
    </div>
  );
};

export default BlockEditor;
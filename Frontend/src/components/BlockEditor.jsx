import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import EditableBlock from "./EditableBlock";
import Notice from "../notice";
import { usePrevious } from "../../hooks";
import { objectId } from "../../utils";

// A page is represented by an array containing several blocks
// [
//   {
//     _id: "5f54d75b114c6d176d7e9765",
//     html: "Heading",
//     tag: "h1",
//     imageUrl: "",
//   },
//   {
//     _id: "5f54d75b114c6d176d7e9766",
//     html: "I am a <strong>paragraph</strong>",
//     tag: "p",
//     imageUrl: "",
//   },
//     _id: "5f54d75b114c6d176d7e9767",
//     html: "/im",
//     tag: "img",
//     imageUrl: "images/test.png",
//   }
// ]

const EditablePage = ({ id, fetchedBlocks, err }) => {
  if (err) {
    return (
      <div>
        <h3>Something went wrong 💔</h3>
        <p>Have you tried to restart the app at '/' ?</p>
      </div>
    );
  }

  const router = useRouter();
  const [blocks, setBlocks] = useState(fetchedBlocks);
  const [currentBlockId, setCurrentBlockId] = useState(null);

  const prevBlocks = usePrevious(blocks);

  // Update the database whenever blocks change
  useEffect(() => {
    const updatePageOnServer = async (blocks) => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API}/pages/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocks: blocks,
          }),
        });
      } catch (err) {
        console.log(err);
      }
    };
    if (prevBlocks && prevBlocks !== blocks) {
      updatePageOnServer(blocks);
    }
  }, [blocks, prevBlocks]);

  // Handling the cursor and focus on adding and deleting blocks
  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === blocks.length) {
      const nextBlockPosition =
        blocks.map((b) => b._id).indexOf(currentBlockId) + 1 + 1;
      const nextBlock = document.querySelector(
        `[data-position="${nextBlockPosition}"]`
      );
      if (nextBlock) {
        nextBlock.focus();
      }
    }
    // If a block was deleted, move the caret to the end of the last block
    if (prevBlocks && prevBlocks.length - 1 === blocks.length) {
      const lastBlockPosition = prevBlocks
        .map((b) => b._id)
        .indexOf(currentBlockId);
      const lastBlock = document.querySelector(
        `[data-position="${lastBlockPosition}"]`
      );
      if (lastBlock) {
        setCaretToEnd(lastBlock);
      }
    }
  }, [blocks, prevBlocks, currentBlockId]);

  const deleteImageOnServer = async (imageUrl) => {
    // The imageUrl contains images/name.jpg, hence we do not need
    // to explicitly add the /images endpoint in the API url
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/pages/${imageUrl}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      await response.json();
    } catch (err) {
      console.log(err);
    }
  };

  const updateBlockHandler = (currentBlock) => {
    const index = blocks.map((b) => b._id).indexOf(currentBlock.id);
    const oldBlock = blocks[index];
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: currentBlock.tag,
      html: currentBlock.html,
      imageUrl: currentBlock.imageUrl,
    };
    setBlocks(updatedBlocks);
    // If the image has been changed, we have to delete the
    // old image file on the server
    if (oldBlock.imageUrl && oldBlock.imageUrl !== currentBlock.imageUrl) {
      deleteImageOnServer(oldBlock.imageUrl);
    }
  };

  const addBlockHandler = (currentBlock) => {
    setCurrentBlockId(currentBlock.id);
    const index = blocks.map((b) => b._id).indexOf(currentBlock.id);
    const updatedBlocks = [...blocks];
    const newBlock = { _id: objectId(), tag: "p", html: "", imageUrl: "" };
    updatedBlocks.splice(index + 1, 0, newBlock);
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: currentBlock.tag,
      html: currentBlock.html,
      imageUrl: currentBlock.imageUrl,
    };
    setBlocks(updatedBlocks);
  };

  const deleteBlockHandler = (currentBlock) => {
    if (blocks.length > 1) {
      setCurrentBlockId(currentBlock.id);
      const index = blocks.map((b) => b._id).indexOf(currentBlock.id);
      const deletedBlock = blocks[index];
      const updatedBlocks = [...blocks];
      updatedBlocks.splice(index, 1);
      setBlocks(updatedBlocks);
      // If the deleted block was an image block, we have to delete
      // the image file on the server
      if (deletedBlock.tag === "img" && deletedBlock.imageUrl) {
        deleteImageOnServer(deletedBlock.imageUrl);
      }
    }
  };

  const onDragEndHandler = (result) => {
    const { destination, source } = result;

    // If we don't have a destination (due to dropping outside the droppable)
    // or the destination hasn't changed, we change nothing
    if (!destination || destination.index === source.index) {
      return;
    }

    const updatedBlocks = [...blocks];
    const removedBlocks = updatedBlocks.splice(source.index - 1, 1);
    updatedBlocks.splice(destination.index - 1, 0, removedBlocks[0]);
    setBlocks(updatedBlocks);
  };

  const isNewPublicPage = router.query.public === "true";
  return (
    <>
      {isNewPublicPage && (
        <Notice dismissible>
          <h4>Hey 👋 You just created a public page.</h4>
          <p>It will be automatically deleted after 24 hours.</p>
        </Notice>
      )}
      <DragDropContext onDragEnd={onDragEndHandler}>
        <Droppable droppableId={id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {blocks.map((block) => {
                const position =
                  blocks.map((b) => b._id).indexOf(block._id) + 1;
                return (
                  <EditableBlock
                    key={block._id}
                    position={position}
                    id={block._id}
                    tag={block.tag}
                    html={block.html}
                    imageUrl={block.imageUrl}
                    pageId={id}
                    addBlock={addBlockHandler}
                    deleteBlock={deleteBlockHandler}
                    updateBlock={updateBlockHandler}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default EditablePage;

// import { useEffect, useRef, useState } from "react";
// import { v4 as uuid } from "uuid";
// import EditableBlock from "./EditableBlock";

// const BlockEditor = () => {
  
//     // block element
//     const initialBlock = { id: uuid(), html: "", tag: "p" };
//     const [blocks, setBlocks] = useState([initialBlock]);
//     const newBlockRef = useRef(null);
//     const [newBlockId, setNewBlockId] = useState(null);

//     // updates blocks on change
//     const updatePageHandler = (updatedBlock) => {
//         setBlocks((prevBlocks) => {
//         return prevBlocks.map((block) =>
//             block.id === updatedBlock.id
//             ? { ...block, tag: updatedBlock.tag, html: updatedBlock.html }
//             : block
//         );
//         });
//     };

//     // adds block next to current block
//     const addBlockHandler = (currentBlock) => {
//         const newBlock = { id: uuid(), html: "new-block", tag: "p" };

//         setBlocks((prevBlocks) => {
//             // find index
//             const index = prevBlocks.findIndex(
//                 (block) => block.id === currentBlock.id
//             );

//             // create updated blocks
//             const updatedBlocks = [...prevBlocks];

//             // add new-block next to current index
//             updatedBlocks.splice(index + 1, 0, newBlock);
//             newBlockRef.current = newBlock.id;

//             setNewBlockId(newBlock.id);

//             return updatedBlocks;
//         });
//     };

//     // deletes a particular block
//     const deleteBlockHandler = (currentBlock) => {

//         setBlocks((prevBlocks) => {

//             // find index
//             const index = prevBlocks.findIndex(
//                 (block) => block.id === currentBlock.id
//             );

//             // if block not found
//             if (index === -1) return prevBlocks;

//             // delete block
//             const updatedBlocks = [...prevBlocks];
//             updatedBlocks.splice(index, 1);

//             // focus on the prev block
//             const prevBlock = currentBlock.ref.previousElementSibling;
//             if (prevBlock) {
//                 prevBlock.focus();
//             }

//             return updatedBlocks;
//         });
//     };

//     useEffect(() => {
//         if(newBlockId) {
//             const newBlock = blocks.find((block) => block.id ===  newBlockId)
//             console.log(newBlock);
//         }
//     }, [blocks, newBlockId]);

//   return (
//     <div>
//         <h1 className="text-2xl">This is the block editor</h1>
//         {blocks.map((block) => (
//             <EditableBlock
//                 key={block.id}
//                 id={block.id}
//                 tag={block.tag}
//                 html={block.html}
//                 updatePage={updatePageHandler}
//                 addBlock={addBlockHandler}
//                 deleteBlock={deleteBlockHandler}
//             />
//         ))}
//     </div>
//   );
// };

// export default BlockEditor;
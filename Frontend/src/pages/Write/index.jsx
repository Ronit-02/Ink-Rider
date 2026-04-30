import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { colors, fonts, fontSizes } from '@/styles/tokens'
import Divider from '@/components/ui/Divider'
import Button from '@/components/ui/Button'
import tagsData from '../../data/tags'
import createPost from "../../api/post/createPost";

export default function WritePage() {
  const navigate = useNavigate();

  // Form States
  const [imageFile, setImageFile] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // tags
  const [tags, setTags] = useState([])
  const [tagText, setTagText] = useState('')

  // Creating Post
  const { mutate, isLoading } = useMutation({
    mutationFn: createPost,
    onSuccess: (response) => {
        navigate(`/post/${response.postId}`);
        // displayNotification(response.message);
    },
    onError: (error) => {
        // displayNotification(error?.response?.data?.message || error.message, 'error');
    },
  });

  // Submitting Form
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('imageURL', imageURL);
    formData.append('title', title);
    formData.append('tags', tags);
    // formData.append('body', JSON.stringify(blocks));
    formData.append('body', body)
    mutate(formData);
  };

  // Input Handlers
  const handleImage = (e) => {
    setImageURL(e.target.files[0]);
    setImageFile(URL.createObjectURL(e.target.files[0]));
  }
  const addTag = (tag) => {
    const updatedTags = [...tags, tag];
    setTags(updatedTags);
    setTagText('');
  }
  const removeTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  }

  // Key Down Handlers
  const handleTagsKeydown = (e) => {
    if(e.key === 'Enter')
      e.preventDefault();
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  return (
    <div style={{ maxWidth: 1200, margin: '0', padding: '60px 32px 80px', display: "flex", flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: fontSizes['3xl'],
              fontWeight: 700,
              marginBottom: 6,
              letterSpacing: '-0.5px',
            }}
          >
            Tell your story.
          </h1>
          <p style={{ fontSize: fontSizes.md, color: colors.textSecondary }}>
            Share your ideas with a community of curious readers.
          </p>
        </div>
        <Button 
          variant="primary" 
          disabled={!title.trim() || isLoading}
          onClick={handleSubmit} 
        >
          Publish
        </Button>
      </div>

      {/* Upload Cover Image */}
      <div
        style={{
          position: "relative",
          height: 250,
          width: "100%",
          border: `2px solid ${colors.bgAlt}`,
          borderRadius: "8px",
        }}
      >
        <label
          htmlFor="coverImage"
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            fontSize: "1.875rem", // ~text-3xl
            cursor: "pointer",
            zIndex: 5,
          }}
        >
          {imageFile ? null : <p>Upload Cover</p>}
        </label>

        {imageFile && (
          <img
            src={imageFile}
            alt="cover-image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        <input
          type="file"
          id="coverImage"
          accept=".png, .jpg, .jpeg"
          name="coverImage"
          onChange={handleImage}
          style={{ display: "none" }}
        />
      </div>

      {/* Tags */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: "8px",
          padding: "8px",
          border: `2px solid ${colors.bgAlt}`,
        }}
      >
        <div
          style={{
            height: "50px",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="Add tags"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            onKeyDown={handleTagsKeydown}
            style={{
              minWidth: "60px",
              height: "100%",
              width: "100%",
              padding: "8px",
              overflow: "hidden",
              outline: "none",
              resize: "none",
              border: "none"
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            gap: "8px",
            height: "fit-content",
          }}
        >
          {tags.map((tag, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "16px",
                padding: "4px 16px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
              }}
            >
              <p style={{ fontWeight: 500 }}>{tag}</p>
              <button style={{border: "none"}} onClick={() => removeTag(index)}>✕</button>
            </div>
          ))}
        </div>

        {tagText &&
          tagsData.filter((tag) =>
            tag.startsWith(tagText.toLowerCase())
          )[0] && (
            <div
              style={{
                position: "absolute",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "8px",
                marginBottom: "16px",
                backgroundColor: "#ffffff",
                border: "2px solid",
                borderRadius: "8px",
                bottom: "100%",
                height: "fit-content",
                width: "fit-content",
              }}
            >
              {tagsData
                .filter((tag) =>
                  tag.startsWith(tagText.toLowerCase())
                )
                .slice(0, 3)
                .map((tag, index) => (
                  <div
                    key={index}
                    onClick={() => addTag(tag)}
                    style={{
                      width: "100%",
                      height: "100%",
                      padding: "8px",
                      textTransform: "capitalize",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {tag}
                  </div>
                ))}
            </div>
          )}
      </div>

      {/* Title input */}
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontFamily: fonts.display,
            fontSize: fontSizes['2xl'],
            fontWeight: 700,
            color: colors.text,
            marginBottom: 20,
            padding: 0,
          }}
        />

        <Divider style={{ marginBottom: 24 }} />

        {/* Body textarea */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          style={{
            width: '100%',
            minHeight: 400,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: fonts.sans,
            fontSize: 15,
            color: colors.text,
            lineHeight: 1.82,
            resize: 'none',
          }}
        />
      </div>

      {/* Word count */}
      {wordCount > 0 && (
        <p
          style={{
            fontSize: fontSizes.sm,
            color: colors.textMuted,
            marginTop: 16,
            textAlign: 'right',
          }}
        >
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </p>
      )}
    </div>
  )
}

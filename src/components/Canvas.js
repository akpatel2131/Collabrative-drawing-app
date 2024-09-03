import React, { useEffect, useRef, useState } from "react";
import { Canvas, Rect, Circle, Line, IText, PencilBrush } from "fabric";
import {
  IconRectangle,
  IconSelectAll,
  IconEraser,
  IconTypography,
  IconCircle,
  IconLine,
  IconArrowBackUp,
  IconBrush,
} from "@tabler/icons-react";
import "./canvas.css";
import { useWindowSize } from "react-use";

const CanvasComponent = () => {
  const canvasRef = useRef(null); // Ref to access the canvas element
  const [canvas, setCanvas] = useState(null); // State to store the Fabric.js canvas instance
  const [brushColor, setBrushColor] = useState("#000000"); // State for brush color
  const [brushSize, setBrushSize] = useState(5); // State for brush size
  const [textValue, setTextValue] = useState(""); // State for text input value
  const [showBrushSizeInput, setShowBrushSizeInput] = useState(false); // State to toggle brush size input
  const [showTextInput, setShowTextInput] = useState(false); // State to toggle text input
  const [isErasing, setIsErasing] = useState(false); // State to toggle eraser mode
  const [mode, setMode] = useState(""); // State to track the current mode (e.g., draw, select, erase)
  const { width } = useWindowSize(); // Hook to get the window width

  // Initialize the Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: width <= 375 ? 330 : width <= 600 ? 550 : 800, // Set width based on screen size
      height: 600, // Fixed height
    });

    const brush = new PencilBrush(fabricCanvas);
    brush.color = brushColor; // Set initial brush color
    brush.width = brushSize; // Set initial brush size
    fabricCanvas.freeDrawingBrush = brush;

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose(); // Clean up the canvas when component unmounts
    };
  }, [canvasRef, brushColor, brushSize, width]);

  // Update brush settings when color or size changes
  useEffect(() => {
    if (!canvas) return;

    const brush = canvas.freeDrawingBrush;
    brush.color = brushColor;
    brush.width = brushSize;
  }, [brushColor, brushSize, canvas]);

  // Handle mode changes (draw, select, erase)
  const handleModeChange = (mode) => {
    setIsErasing(false);
    if (!canvas) return;
    setMode(mode);
    if (mode === "erase") {
      canvas.isDrawingMode = false;
      setIsErasing(true);
    } else if (mode === "draw") {
      const brush = new PencilBrush(canvas);
      brush.color = brushColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    } else if (mode === "select") {
      canvas.isDrawingMode = false;
    }
  };

  // Add text to the canvas
  const handleAddText = () => {
    if (!canvas || !textValue) return;

    setMode("text");

    const text = new IText(textValue, {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: brushColor,
    });
    canvas.add(text);
    setTextValue("");
    setShowTextInput(false);
  };

  // Undo the last action (remove last object)
  const handleUndo = () => {
    if (!canvas) return;
    setMode("undo");
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      const lastObject = objects[objects.length - 1];
      canvas.remove(lastObject);
    }
  };

  // Add a shape (rectangle, circle, or line) to the canvas
  const handleAddShape = (shape) => {
    if (!canvas) return;

    setMode(shape);

    let object;
    if (shape === "rectangle") {
      object = new Rect({
        left: 100,
        top: 100,
        fill: brushColor,
        width: 100,
        height: 100,
      });
    } else if (shape === "circle") {
      object = new Circle({
        left: 150,
        top: 150,
        radius: 50,
        fill: brushColor,
      });
    } else if (shape === "line") {
      object = new Line([50, 100, 200, 200], {
        stroke: brushColor,
        strokeWidth: brushSize,
      });
    }

    setIsErasing(false);

    if (object) {
      canvas.add(object);
    }
  };

  // Handle mouse events for erasing shapes
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event) => {
      if (isErasing) {
        const target = canvas.findTarget(event);
        if (target) {
          canvas.remove(target);
        }
      }
    };

    canvas.on('mouse:down', handleMouseDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [canvas, isErasing]);
  return (
    <div className="canvas-container">
      <div className="drawing-action-container">
        <button
          onClick={() => {
            handleModeChange("draw");
          }}
          className={mode === "draw" && `selected-button`}
        >
          <IconBrush stroke={2} />
        </button>
        <button
          onClick={() => {
            handleModeChange("select");
          }}
          className={mode === "select" && `selected-button`}
        >
          <IconSelectAll stroke={2} />
        </button>
        <button
          onClick={() => {
            handleModeChange("erase");
          }}
          className={mode === "erase" && `selected-button`}
        >
          <IconEraser stroke={2} />
        </button>
        <button
          onClick={() => {
            setShowTextInput(true);
          }}
          className={mode === "text" && ``}
        >
          <IconTypography stroke={2} />
        </button>
        <button onClick={() => handleAddShape("rectangle")} className={mode === "rectangle" && `selected-button`}>
          <IconRectangle stroke={2} />
        </button>
        <button onClick={() => handleAddShape("circle")} className={mode === "circle" && `selected-button`}>
          <IconCircle stroke={2} />
        </button>
        <button onClick={() => handleAddShape("line")} className={mode === "line" && `selected-button`}>
          <IconLine stroke={2} />
        </button>
        <button onClick={handleUndo}>
          <IconArrowBackUp stroke={2} />
        </button>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
        />
        {showBrushSizeInput && (
          <div className="popup-input" style={{ top: 10, left: 10 }}>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>
        )}

        {showTextInput && (
          <div className="popup-input" style={{ top: 50, left: 10 }}>
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text"
            />
            <button onClick={handleAddText}>Add Text</button>
            <button onClick={() => setShowTextInput(false)}>Cancel</button>
          </div>
        )}
      </div>
      <div className="canvas-box">
        <canvas ref={canvasRef} className="canvas" />
      </div>
    </div>
  );
};

export default CanvasComponent;

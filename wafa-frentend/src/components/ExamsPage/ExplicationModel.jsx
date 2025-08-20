import React from "react";

const ExplicationModel = ({ question }) => {
  return (
    <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm max-w-2xl mx-auto">
      {question?.explicationTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {question.explicationTitle}
        </h3>
      )}
      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button className="px-4 py-1 font-medium border-b-2 border-blue-600 text-blue-700 bg-white rounded-t-md focus:outline-none">
          explication AI
        </button>
        <button className="px-4 py-1 font-medium text-gray-600 ml-2 bg-white rounded-t-md focus:outline-none">
          vous explications
        </button>
      </div>

      {/* Sub-tabs (Pills) */}
      <div className="flex items-center space-x-2 mb-4">
        <button className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-300">
          explications 1
        </button>
        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-300">
          explication 2
        </button>
        <button
          className="px-4 py-1 rounded-full bg-gray-50 text-gray-400 font-medium border border-gray-200 cursor-not-allowed flex items-center"
          disabled
        >
          <span className="text-lg mr-1">+</span>ajouter
        </button>
      </div>

      {/* Images (optional) */}
      {(() => {
        const images =
          (Array.isArray(question?.explanationImages)
            ? question.explanationImages
            : []) || [];
        if (!images.length && question?.explanationImage) {
          images.push(question.explanationImage);
        }
        if (!images.length) return null;
        return (
          <div className="mb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  className="group relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                  onClick={() =>
                    window.open(src, "_blank", "noopener,noreferrer")
                  }
                  title="Open image in new tab"
                >
                  <img
                    src={src}
                    alt={`explication ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Explanation Text (optional) */}
      {question?.explanation ? (
        <div className="border border-gray-300 rounded-lg bg-white min-h-[120px] p-4 text-gray-800 text-base whitespace-pre-line">
          {question.explanation}
        </div>
      ) : null}

      {/* Empty state if neither text nor image exists */}
      {!question?.explanation &&
        !question?.explanationImage &&
        !(
          Array.isArray(question?.explanationImages) &&
          question.explanationImages.length > 0
        ) && (
          <div className="text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg p-4">
            Aucune explication fournie.
          </div>
        )}

      {/* Correct Answers (if multipleChoice) */}
      {question.multipleChoice && (
        <div className="mt-4 text-blue-700 text-sm">
          <strong>Réponses correctes:</strong>{" "}
          {question.correctAnswers.join(", ")}
        </div>
      )}
    </div>
  );
};

export default ExplicationModel;

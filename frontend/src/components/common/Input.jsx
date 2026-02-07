export function Input({ label, error, icon, className = "", labelClassName = "", inputClassName = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${labelClassName || 'text-gray-700 dark:text-gray-300'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 ${icon ? 'pl-10' : ''}
            bg-white dark:bg-gray-800
            border-2 border-gray-300 dark:border-gray-600
            rounded-xl
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:border-primary-500 dark:focus:border-primary-400
            focus:ring-4 focus:ring-primary-500/20
            transition-all duration-200
            outline-none
            ${error ? 'border-danger-500 dark:border-danger-400 focus:border-danger-500 focus:ring-danger-500/20' : ''}
            ${inputClassName}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-danger-600 dark:text-danger-400 animate-slideDown flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}


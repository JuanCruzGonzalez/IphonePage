interface PaginationProps<T = any> {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number, extra?: T) => void;
  extra?: T;
}

export const Pagination = <T = any,>({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  extra,
}: PaginationProps<T>) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const showingFrom = totalItems === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const showingTo = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 }}>
      <div>
        Mostrando {showingFrom} - {showingTo} de {totalItems}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button 
          className="btn-sm btn-pager" 
          onClick={() => onPageChange(Math.max(1, currentPage - 1), extra)} 
          disabled={currentPage <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="#000" height="20" width="20" version="1.1" id="Layer_1" viewBox="0 0 512.006 512.006">
            <g>
              <g>
                <path d="M388.419,475.59L168.834,256.005L388.418,36.421c8.341-8.341,8.341-21.824,0-30.165s-21.824-8.341-30.165,0    L123.586,240.923c-8.341,8.341-8.341,21.824,0,30.165l234.667,234.667c4.16,4.16,9.621,6.251,15.083,6.251    c5.461,0,10.923-2.091,15.083-6.251C396.76,497.414,396.76,483.931,388.419,475.59z" />
              </g>
            </g>
          </svg>
        </button>
        <div style={{ padding: '6px 10px' }}>{currentPage} / {totalPages}</div>
        <button 
          className="btn-sm btn-pager" 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1), extra)} 
          disabled={currentPage >= totalPages}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 512.005 512.005">
            <g>
              <g>
                <path d="M388.418,240.923L153.751,6.256c-8.341-8.341-21.824-8.341-30.165,0s-8.341,21.824,0,30.165L343.17,256.005    L123.586,475.589c-8.341,8.341-8.341,21.824,0,30.165c4.16,4.16,9.621,6.251,15.083,6.251c5.461,0,10.923-2.091,15.083-6.251    l234.667-234.667C396.759,262.747,396.759,249.264,388.418,240.923z" />
              </g>
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
};

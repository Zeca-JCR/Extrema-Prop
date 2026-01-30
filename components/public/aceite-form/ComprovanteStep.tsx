import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useAceiteForm } from '@/hooks/useAceiteForm';
import { AceiteFormData } from '@/lib/schemas';
import { readFileAsBase64, formatCurrency } from '@/lib/utils';

type ComprovanteStepProps = Pick<ReturnType<typeof useAceiteForm>,
    'valorPix' | 'comprovanteFile' | 'setComprovanteFile' |
    'comprovantePreview' | 'setComprovantePreview' |
    'uploadProgress' | 'setUploadProgress' |
    'erros' | 'isLoading' |
    'setEtapa' | 'enviarComprovante' | 'simulateUpload'
>;

export default function ComprovanteStep({
    valorPix, comprovanteFile, setComprovanteFile,
    comprovantePreview, setComprovantePreview,
    uploadProgress, setUploadProgress,
    erros, isLoading,
    setEtapa, enviarComprovante, simulateUpload
}: ComprovanteStepProps) {
    const { register } = useFormContext<AceiteFormData>();
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setIsProcessing(true);
            const interval = simulateUpload();

            const file = acceptedFiles[0];

            // Simular tempo de upload
            await new Promise(resolve => setTimeout(resolve, 800));

            setComprovanteFile(file);
            const preview = await readFileAsBase64(file);
            setComprovantePreview(preview);

            clearInterval(interval);
            setUploadProgress(100);
            setTimeout(() => setIsProcessing(false), 300);
        }
    }, [simulateUpload, setComprovanteFile, setComprovantePreview, setUploadProgress]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    // Permitir colar (CTRL+V) o comprovante
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') === 0 || item.type === 'application/pdf') {
                    const file = item.getAsFile();
                    if (file) {
                        setIsProcessing(true);
                        const interval = simulateUpload();

                        // Pequeno delay para mostrar o progresso
                        await new Promise(resolve => setTimeout(resolve, 800));

                        setComprovanteFile(file);
                        const preview = await readFileAsBase64(file);
                        setComprovantePreview(preview);

                        clearInterval(interval);
                        setUploadProgress(100);
                        setTimeout(() => setIsProcessing(false), 300);

                        // Feedback visual (opcional)
                        const dropzone = document.querySelector('.dropzone-area');
                        if (dropzone) {
                            dropzone.classList.add('ring-4', 'ring-green-400');
                            setTimeout(() => dropzone.classList.remove('ring-4', 'ring-green-400'), 500);
                        }
                    }
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [simulateUpload, setComprovanteFile, setComprovantePreview, setUploadProgress]);

    const showLoading = isLoading || isProcessing;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Envie o comprovante de pagamento
                </h3>
                <p className="text-gray-600 text-sm">
                    Anexe o comprovante do PIX no valor de {formatCurrency(valorPix)}
                </p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`dropzone-area border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragActive ? 'border-extrema-purple bg-purple-50 scale-[1.02]' : 'border-gray-300 hover:border-extrema-purple hover:bg-gray-50'}`}
            >
                <input {...getInputProps()} />

                {!comprovantePreview && !showLoading && (
                    <>
                        <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-gray-900 font-medium mb-1">
                            Clique para enviar ou arraste o arquivo aqui
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            (PDF, JPG ou PNG de até 5MB)
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-1 px-3 rounded-full mx-auto w-fit">
                            <span className="font-bold">Dica:</span>
                            Você também pode pressionar <kbd className="font-mono bg-white border border-gray-200 rounded px-1">Ctrl+V</kbd> para colar
                        </div>
                    </>
                )}

                {showLoading && (
                    <div className="py-4">
                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div
                                className="absolute top-0 left-0 h-full bg-extrema-purple transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium animate-pulse">
                            Processando arquivo... {uploadProgress}%
                        </p>
                    </div>
                )}

                {comprovantePreview && !showLoading && (
                    <div className="relative group">
                        {comprovanteFile?.type.includes('image') ? (
                            <img src={comprovantePreview} alt="Comprovante" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
                                <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium text-gray-900">{comprovanteFile?.name}</span>
                                <span className="text-xs text-gray-500 mt-1">PDF Document</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <p className="text-white font-medium">Clique para alterar</p>
                        </div>
                    </div>
                )}
            </div>

            {erros.comprovante && (
                <p className="text-sm text-red-600 text-center">{erros.comprovante}</p>
            )}

            {/* Observações */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações (opcional)
                </label>
                <textarea
                    {...register('observacoes')}
                    className="input min-h-[80px]"
                    placeholder="Alguma informação adicional sobre o pagamento..."
                />
            </div>

            {/* Botões */}
            <div className="flex justify-between pt-4">
                <button onClick={() => setEtapa('pix')} className="btn btn-secondary">
                    ← Voltar
                </button>
                <button
                    onClick={enviarComprovante}
                    disabled={!comprovanteFile || isLoading}
                    className="btn btn-primary disabled:opacity-50"
                >
                    {isLoading ? 'Enviando...' : 'Enviar e Finalizar ✓'}
                </button>
            </div>
        </div>
    );
}

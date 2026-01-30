import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { AceiteFormData } from '@/lib/schemas';
import { mascaraCNPJ, mascaraCEP, mascaraTelefone, mascaraCPF } from '@/lib/validators';

interface DadosStepProps {
    isFetchingCnpj: boolean;
    handleCnpjBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    validarEContinuar: () => void;
    onClose: () => void;
    erros: Record<string, string>; // Erros extras de submit
}

export default function DadosStep({ isFetchingCnpj, handleCnpjBlur, validarEContinuar, onClose, erros }: DadosStepProps) {
    const { register, control, watch, formState: { errors } } = useFormContext<AceiteFormData>();

    const cnpj = watch('dadosCadastrais.cnpj');
    const responsavelAceiteMesmoLegal = watch('dadosCadastrais.responsavelAceiteMesmoLegal');

    // Helpers para erro
    const getError = (path: string) => {
        // Acessar erro aninhado: errors.dadosCadastrais?.cnpj?.message
        const parts = path.split('.');
        let obj: any = errors;
        for (const p of parts) {
            obj = obj?.[p];
        }
        return obj?.message as string | undefined;
    };

    return (
        <div className="space-y-6">
            {erros.submit && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-sm text-red-700">{erros.submit}</p>
                </div>
            )}

            <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Dados da Empresa</h3>
                <p className="text-sm text-gray-500">Preencha os dados cadastrais da Pessoa Jurídica</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CNPJ */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                    <div className="relative">
                        <Controller
                            control={control}
                            name="dadosCadastrais.cnpj"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    onChange={(e) => field.onChange(mascaraCNPJ(e.target.value))}
                                    onBlur={(e) => {
                                        field.onBlur();
                                        handleCnpjBlur(e);
                                    }}
                                    className={`input pr-10 text-base md:text-sm ${getError('dadosCadastrais.cnpj') ? 'border-red-500 focus:ring-red-500' : (!getError('dadosCadastrais.cnpj') && cnpj?.length === 18) ? 'border-green-500 focus:ring-green-500' : ''}`}
                                    placeholder="00.000.000/0000-00"
                                    maxLength={18}
                                    inputMode="numeric"
                                />
                            )}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {isFetchingCnpj ? (
                                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : cnpj?.length === 18 && (
                                !getError('dadosCadastrais.cnpj') ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>
                            )}
                        </div>
                    </div>
                    {getError('dadosCadastrais.cnpj') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.cnpj')}</p>}
                    {isFetchingCnpj && <p className="text-xs text-blue-600 mt-1">Buscando dados da empresa...</p>}
                </div>

                {/* Razão Social e Nome Fantasia */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                    <input {...register('dadosCadastrais.razaoSocial')} className={`input text-base md:text-sm ${getError('dadosCadastrais.razaoSocial') ? 'border-red-500' : ''}`} placeholder="Razão Social" />
                    {getError('dadosCadastrais.razaoSocial') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.razaoSocial')}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia *</label>
                    <input {...register('dadosCadastrais.nomeFantasia')} className={`input text-base md:text-sm ${getError('dadosCadastrais.nomeFantasia') ? 'border-red-500' : ''}`} placeholder="Nome Fantasia" />
                    {getError('dadosCadastrais.nomeFantasia') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.nomeFantasia')}</p>}
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                    <input {...register('dadosCadastrais.endereco.rua')} className={`input text-base md:text-sm ${getError('dadosCadastrais.endereco.rua') ? 'border-red-500' : ''}`} placeholder="Rua, Avenida, etc." />
                    {getError('dadosCadastrais.endereco.rua') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.endereco.rua')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                    <input {...register('dadosCadastrais.endereco.numero')} className={`input text-base md:text-sm ${getError('dadosCadastrais.endereco.numero') ? 'border-red-500' : ''}`} placeholder="Nº" />
                    {getError('dadosCadastrais.endereco.numero') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.endereco.numero')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                    <input {...register('dadosCadastrais.endereco.bairro')} className={`input text-base md:text-sm ${getError('dadosCadastrais.endereco.bairro') ? 'border-red-500' : ''}`} placeholder="Bairro" />
                    {getError('dadosCadastrais.endereco.bairro') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.endereco.bairro')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input {...register('dadosCadastrais.endereco.complemento')} className="input text-base md:text-sm" placeholder="Sala, Apto..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                    <Controller
                        control={control}
                        name="dadosCadastrais.endereco.cep"
                        render={({ field }) => (
                            <input
                                {...field}
                                onChange={(e) => field.onChange(mascaraCEP(e.target.value))}
                                className={`input text-base md:text-sm ${getError('dadosCadastrais.endereco.cep') ? 'border-red-500' : ''}`}
                                placeholder="00000-000" maxLength={9} inputMode="numeric"
                            />
                        )}
                    />
                    {getError('dadosCadastrais.endereco.cep') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.endereco.cep')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                    <input {...register('dadosCadastrais.endereco.cidade')} className={`input text-base md:text-sm ${getError('dadosCadastrais.endereco.cidade') ? 'border-red-500' : ''}`} placeholder="Cidade" />
                    {getError('dadosCadastrais.endereco.cidade') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.endereco.cidade')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
                    <select {...register('dadosCadastrais.endereco.uf')} className={`input text-base md:text-sm ${getError('dadosCadastrais.endereco.uf') ? 'border-red-500' : ''}`}>
                        <option value="">Selecione...</option>
                        {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                        ))}
                    </select>
                    {getError('dadosCadastrais.endereco.uf') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.endereco.uf')}</p>}
                </div>

                {/* Fiscal */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                    <input {...register('dadosCadastrais.inscricaoEstadual')} className="input text-base md:text-sm" placeholder="Isento se não houver" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Regime Tributário</label>
                    <div className="flex flex-wrap gap-4">
                        {['MEI', 'Simples Nacional', 'Lucro Presumido', 'Lucro Real'].map((regime) => (
                            <label key={regime} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value={regime}
                                    {...register('dadosCadastrais.regimeTributario')}
                                    className="mr-2 text-extrema-purple"
                                />
                                <span className="text-sm text-gray-700">{regime}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Responsável Legal */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Responsável Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                        <input {...register('dadosCadastrais.responsavel.nome')} className={`input text-base md:text-sm ${getError('dadosCadastrais.responsavel.nome') ? 'border-red-500' : ''}`} placeholder="Nome completo" />
                        {getError('dadosCadastrais.responsavel.nome') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.responsavel.nome')}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                        <input {...register('dadosCadastrais.responsavel.cargo')} className={`input text-base md:text-sm ${getError('dadosCadastrais.responsavel.cargo') ? 'border-red-500' : ''}`} placeholder="Sócio, Diretor, etc." />
                        {getError('dadosCadastrais.responsavel.cargo') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.responsavel.cargo')}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF do Responsável *</label>
                        <div className="relative">
                            <Controller
                                control={control}
                                name="dadosCadastrais.responsavel.cpf"
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        onChange={(e) => field.onChange(mascaraCPF(e.target.value))}
                                        className={`input pr-10 text-base md:text-sm ${getError('dadosCadastrais.responsavel.cpf') ? 'border-red-500 focus:ring-red-500' : (!getError('dadosCadastrais.responsavel.cpf') && field.value?.length === 14) ? 'border-green-500 focus:ring-green-500' : ''}`}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        inputMode="numeric"
                                    />
                                )}
                            />
                            {/* Ícone de validação do CPF omitido ou simplificado via bordas acima */}
                        </div>
                        {getError('dadosCadastrais.responsavel.cpf') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.responsavel.cpf')}</p>}
                    </div>
                </div>
            </div>

            {/* Contato */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Contato da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/Celular *</label>
                        <Controller
                            control={control}
                            name="dadosCadastrais.telefone"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    onChange={(e) => field.onChange(mascaraTelefone(e.target.value))}
                                    className={`input text-base md:text-sm ${getError('dadosCadastrais.telefone') ? 'border-red-500' : ''}`}
                                    placeholder="(00) 00000-0000" maxLength={15} inputMode="numeric"
                                />
                            )}
                        />
                        {getError('dadosCadastrais.telefone') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.telefone')}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input {...register('dadosCadastrais.email')} className={`input text-base md:text-sm ${getError('dadosCadastrais.email') ? 'border-red-500' : ''}`} placeholder="email@empresa.com.br" inputMode="email" />
                        {getError('dadosCadastrais.email') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.email')}</p>}
                    </div>
                </div>
            </div>

            {/* Contabilidade */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Contabilidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome/Escritório de Contabilidade *</label>
                        <input {...register('dadosCadastrais.contabilidade.nome')} className={`input text-base md:text-sm ${getError('dadosCadastrais.contabilidade.nome') ? 'border-red-500' : ''}`} placeholder="Nome da contabilidade" />
                        {getError('dadosCadastrais.contabilidade.nome') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.contabilidade.nome')}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa de Contato *</label>
                        <input {...register('dadosCadastrais.contabilidade.contato')} className={`input text-base md:text-sm ${getError('dadosCadastrais.contabilidade.contato') ? 'border-red-500' : ''}`} placeholder="Nome do contato" />
                        {getError('dadosCadastrais.contabilidade.contato') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.contabilidade.contato')}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Contabilidade *</label>
                        <Controller
                            control={control}
                            name="dadosCadastrais.contabilidade.telefone"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    onChange={(e) => field.onChange(mascaraTelefone(e.target.value))}
                                    className={`input text-base md:text-sm ${getError('dadosCadastrais.contabilidade.telefone') ? 'border-red-500' : ''}`}
                                    placeholder="(00) 00000-0000" maxLength={15} inputMode="numeric"
                                />
                            )}
                        />
                        {getError('dadosCadastrais.contabilidade.telefone') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.contabilidade.telefone')}</p>}
                    </div>
                </div>
            </div>

            {/* Responsável pelo Aceite */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Pessoa que está confirmando a proposta</h3>
                <div className="space-y-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('dadosCadastrais.responsavelAceiteMesmoLegal')}
                            className="w-4 h-4 text-extrema-purple border-gray-300 rounded focus:ring-extrema-purple"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            A confirmação está sendo feita pelo responsável legal da empresa.
                        </span>
                    </label>

                    {!responsavelAceiteMesmoLegal && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                            <input
                                {...register('dadosCadastrais.responsavelAceiteNome')}
                                className={`input text-base md:text-sm ${getError('dadosCadastrais.responsavelAceiteNome') ? 'border-red-500' : ''}`}
                                placeholder="Nome de quem confirmou a proposta"
                            />
                            <p className="text-xs text-gray-500 mt-1">Informação registrada apenas para controle interno.</p>
                            {getError('dadosCadastrais.responsavelAceiteNome') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.responsavelAceiteNome')}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Termos */}
            <div className="pt-4 border-t border-gray-200">
                <label className="flex items-start cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('dadosCadastrais.aceitouTermos')}
                        className="mt-1 mr-3 w-4 h-4 text-extrema-purple border-gray-300 rounded focus:ring-extrema-purple"
                    />
                    <span className="text-sm text-gray-700">Declaro que li e aceito os termos da proposta comercial e confirmo que os dados cadastrais acima são verdadeiros.</span>
                </label>
                {getError('dadosCadastrais.aceitouTermos') && <p className="text-xs text-red-600 mt-1">{getError('dadosCadastrais.aceitouTermos')}</p>}
            </div>

            {/* Botões */}
            <div className="flex justify-between pt-4">
                <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
                <button onClick={validarEContinuar} className="btn btn-primary">Continuar para Pagamento →</button>
            </div>
        </div>
    );
}

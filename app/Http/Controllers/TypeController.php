<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Types/index', [
            'types' => Type::where('user_id', Auth::id())->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'types' => 'required|array',
            'types.*' => 'required|string|max:30|unique:types,name'
        ], [
            'types.*.required' => 'Type name is required',
            'types.*.max' => 'Type name cannot be longer than 30 characters',
            'types.*.unique' => 'Type ":input" already exists'
        ]);


        collect($validated['types'])->each(function ($typeName) {
            Type::create(['name' => trim($typeName), 'user_id' => Auth::id()]);
        });

        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(Type $type)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Type $type)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Type $type)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Type $type)
    {
        $type->delete();
        return redirect()->back();
    }
}
